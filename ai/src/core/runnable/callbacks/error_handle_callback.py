

from core.runnable.callbacks.base_callback_handler import BaseCallbackHandler


class ErrorManagerCallbackHanlder(BaseCallbackHandler):
    """A callback handler that manages errors during LLM execution.

    Args:
        BaseCallbackHandler (_type_): _description_
    """
    
    
    def on_llm_error(self, *args, **kwargs):
        """
        Callback triggered when the LLM encounters an error.
        
        Args:
            error (Exception): The error encountered by the LLM.
        """
        # Handle the error here
        print(f"Error encountered: {args}")
        print(f"Error details: {kwargs}")