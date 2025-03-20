import os
import json
from typing import Dict, List, Any, Optional, TypedDict, Annotated, Union
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Request, Form, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import uvicorn

# LangGraph imports
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

# Import tools
from tools.stock_tool import get_stock_info
from tools.weather_tool import get_weather_info

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Define message models
class Message(BaseModel):
    role: str
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None
    name: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    message: Message

# Define state for the LangGraph
class AgentState(TypedDict):
    messages: List[Union[HumanMessage, AIMessage, SystemMessage, ToolMessage]]

# Configure LLM
llm = ChatOpenAI(
    model="gpt-4-turbo",
    temperature=0,
)

# Define system prompt
system_prompt = """
You are a helpful assistant that can provide information about stocks and weather.

When responding to user queries about stocks or weather, use the appropriate tools to fetch real-time data.

For UI rendering, you should use the following format when appropriate:

1. For stock information:
```json
{
  "type": "stock_chart",
  "data": {
    "symbol": "AAPL",
    "price": 150.25,
    "change": 2.5,
    "percent_change": "1.7%"
  }
}
```

2. For weather information:
```json
{
  "type": "weather_card",
  "data": {
    "location": "New York",
    "temperature": 72,
    "condition": "Sunny",
    "humidity": 65
  }
}
```

Embed these JSON objects in your responses when you want to display visual components.
The frontend will render these components appropriately.
"""

# Define the agent nodes
def create_agent_graph():
    # Create the agent prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(content=system_prompt),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )
    
    # Create the agent node
    def agent_node(state: AgentState):
        messages = state["messages"]
        response = llm.invoke(prompt.invoke({"messages": messages}))
        return {"messages": messages + [response]}
    
    # Create tool nodes
    tools = ToolNode(tools=[get_stock_info, get_weather_info])
    
    # Create the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", tools)
    
    # Add edges
    workflow.add_edge("agent", "tools")
    workflow.add_edge("tools", "agent")
    workflow.add_edge("agent", END)
    
    # Set the entry point
    workflow.set_entry_point("agent")
    
    # Compile the graph
    return workflow.compile()

# Create the agent graph
agent_graph = create_agent_graph()

# API endpoints
@app.get("/")
async def read_root():
    return {"message": "Generative UI API is running"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Convert the messages to LangChain format
    messages = []
    for msg in request.messages:
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            if msg.tool_calls:
                messages.append(AIMessage(content=msg.content, tool_calls=msg.tool_calls))
            else:
                messages.append(AIMessage(content=msg.content))
        elif msg.role == "tool":
            messages.append(ToolMessage(content=msg.content, tool_call_id=msg.tool_call_id, name=msg.name))
    
    # Invoke the agent graph
    result = agent_graph.invoke({"messages": messages})
    last_message = result["messages"][-1]
    
    # Convert the response back to the API format
    if isinstance(last_message, AIMessage):
        response_message = Message(
            role="assistant",
            content=last_message.content,
            tool_calls=last_message.tool_calls if hasattr(last_message, "tool_calls") else None
        )
    else:
        raise HTTPException(status_code=500, detail="Unexpected message type in response")
    
    return ChatResponse(message=response_message)

# WebSocket endpoint for real-time chat
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            request_data = json.loads(data)
            
            # Convert the messages to LangChain format
            messages = []
            for msg in request_data["messages"]:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    if "tool_calls" in msg and msg["tool_calls"]:
                        messages.append(AIMessage(content=msg["content"], tool_calls=msg["tool_calls"]))
                    else:
                        messages.append(AIMessage(content=msg["content"]))
                elif msg["role"] == "tool":
                    messages.append(ToolMessage(
                        content=msg["content"],
                        tool_call_id=msg["tool_call_id"],
                        name=msg["name"]
                    ))
            
            # Invoke the agent graph
            result = agent_graph.invoke({"messages": messages})
            last_message = result["messages"][-1]
            
            # Convert the response back to the API format
            if isinstance(last_message, AIMessage):
                response_message = {
                    "role": "assistant",
                    "content": last_message.content,
                }
                if hasattr(last_message, "tool_calls") and last_message.tool_calls:
                    response_message["tool_calls"] = last_message.tool_calls
            else:
                response_message = {"error": "Unexpected message type in response"}
            
            # Send response back to client
            await websocket.send_text(json.dumps({"message": response_message}))
    except WebSocketDisconnect:
        print("Client disconnected")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
