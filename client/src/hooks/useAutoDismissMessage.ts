import { useCallback, useEffect, useRef, useState } from 'react';

type AutoDismissMessageOptions = {
      successDuration?: number;
      errorDuration?: number;
      warningDuration?: number;
      infoDuration?: number;
};

type MessageType = 'success' | 'error' | 'warning' | 'info';

type AppMessageState = {
      type: MessageType;
      text: string;
};

export function useAutoDismissMessage(options?: AutoDismissMessageOptions) {
      const successDuration = options?.successDuration ?? 5000;
      const errorDuration = options?.errorDuration ?? 7000;
      const warningDuration = options?.warningDuration ?? 7000;
      const infoDuration = options?.infoDuration ?? 5000;

      const [successMessage, setSuccessMessageState] = useState('');
      const [errorMessage, setErrorMessageState] = useState('');
      const [message, setMessageState] = useState<AppMessageState | null>(null);

      const successTimerRef = useRef<number | null>(null);
      const errorTimerRef = useRef<number | null>(null);
      const messageTimerRef = useRef<number | null>(null);

      const clearTimer = useCallback((timerRef: React.MutableRefObject<number | null>) => {
            if (timerRef.current) {
                  window.clearTimeout(timerRef.current);
                  timerRef.current = null;
            }
      }, []);

      const clearSuccessMessage = useCallback(() => {
            clearTimer(successTimerRef);
            setSuccessMessageState('');
      }, [clearTimer]);

      const clearErrorMessage = useCallback(() => {
            clearTimer(errorTimerRef);
            setErrorMessageState('');
      }, [clearTimer]);

      const clearMessage = useCallback(() => {
            clearTimer(messageTimerRef);
            setMessageState(null);
      }, [clearTimer]);

      const clearAllMessages = useCallback(() => {
            clearSuccessMessage();
            clearErrorMessage();
            clearMessage();
      }, [clearSuccessMessage, clearErrorMessage, clearMessage]);

      const setSuccessMessage = useCallback(
            (text: string) => {
                  clearTimer(successTimerRef);
                  clearTimer(errorTimerRef);

                  setSuccessMessageState(text);
                  setErrorMessageState('');

                  if (text) {
                        successTimerRef.current = window.setTimeout(() => {
                              setSuccessMessageState('');
                              successTimerRef.current = null;
                        }, successDuration);
                  }
            },
            [clearTimer, successDuration]
      );

      const setErrorMessage = useCallback(
            (text: string) => {
                  clearTimer(errorTimerRef);
                  clearTimer(successTimerRef);

                  setErrorMessageState(text);
                  setSuccessMessageState('');

                  if (text) {
                        errorTimerRef.current = window.setTimeout(() => {
                              setErrorMessageState('');
                              errorTimerRef.current = null;
                        }, errorDuration);
                  }
            },
            [clearTimer, errorDuration]
      );

      const showMessage = useCallback(
            (type: MessageType, text: string) => {
                  clearTimer(messageTimerRef);
                  setMessageState({ type, text });

                  if (text) {
                        const duration =
                              type === 'error'
                                    ? errorDuration
                                    : type === 'warning'
                                          ? warningDuration
                                          : type === 'success'
                                                ? successDuration
                                                : infoDuration;

                        messageTimerRef.current = window.setTimeout(() => {
                              setMessageState(null);
                              messageTimerRef.current = null;
                        }, duration);
                  }
            },
            [clearTimer, errorDuration, warningDuration, successDuration, infoDuration]
      );

      useEffect(() => {
            return () => {
                  clearTimer(successTimerRef);
                  clearTimer(errorTimerRef);
                  clearTimer(messageTimerRef);
            };
      }, [clearTimer]);

      return {
            successMessage,
            errorMessage,
            message,

            setSuccessMessage,
            setErrorMessage,
            showMessage,

            clearSuccessMessage,
            clearErrorMessage,
            clearMessage,
            clearAllMessages,
      };
}
