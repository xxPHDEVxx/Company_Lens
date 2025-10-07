from langchain.callbacks.base import BaseCallbackHandler as LGBaseCallbackHandler


class BaseCallbackHandler(LGBaseCallbackHandler):
    """
    A callback handler that logs the LLM start and end events.

    Args:
        BaseCallbackHandler (_type_): _description_
    """

    def on_llm_start(self, *args, **kwargs):
        """
        Callback triggered when the LLM starts.

        Args:
            serialized (_type_): _description_
            prompts (_type_): _description_
        """
    
    def on_llm_end(self, *args, **kwargs):
        """
        Callback triggered when the LLM ends.

        Args:
            response (_type_): _description_
        """
