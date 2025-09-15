// Chrome Extension API types for SpeedThreads
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (message: any, callback?: (response: any) => void) => void;
        onMessage?: {
          addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
        };
      };
    };
  }
}

export {};
