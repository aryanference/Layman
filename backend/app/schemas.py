from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Difficulty = Literal["SIMPLE", "INTERMEDIATE", "HARD"]
ChatRole = Literal["system", "user", "assistant"]


class ChatMessage(BaseModel):
  role: ChatRole
  content: str

  model_config = ConfigDict(extra="ignore")


class ChatAttachment(BaseModel):
  name: str | None = None
  content: str | None = None
  type: str | None = None

  model_config = ConfigDict(extra="ignore")


class SelectedProvider(BaseModel):
  id: str | None = None
  label: str | None = None
  api_key: str | None = None
  base_url: str | None = None
  protocol: str | None = None

  model_config = ConfigDict(extra="ignore")


class ChatRequest(BaseModel):
  message: str = ""
  conversation_history: list[ChatMessage] = Field(default_factory=list)
  selected_model: str | None = None
  selected_provider: SelectedProvider | None = None
  attachments: list[ChatAttachment] = Field(default_factory=list)

  model_config = ConfigDict(extra="ignore")


class ChatMetadata(BaseModel):
  difficulty: Difficulty | None = None
  model_used: str
  tier_name: str
  tokens_used: int


class FreeModelInfo(BaseModel):
  id: str
  name: str
  description: str
  context_length: int
  difficulty: str | None = None


class ChatResponse(BaseModel):
  response: str
  metadata: ChatMetadata


class HealthResponse(BaseModel):
  status: Literal["ok", "degraded"]
  llm_configured: bool
  detail: str
