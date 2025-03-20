from langchain_openai.chat_models import ChatOpenAI


class LLM:
    GPT_3_5_TURBO = ChatOpenAI(model="gpt-3.5-turbo")
    GPT_4O_MINI = ChatOpenAI(model="gpt-4o-mini")
    GPT_4_TURBO = ChatOpenAI(model="gpt-4-turbo-2024-04-09")
