import { ApiException } from '../services/apiClient';

interface ApiErrorDisplayProps {
  error: Error | ApiException;
  onRetry?: () => void;
  className?: string;
}

export const ApiErrorDisplay = ({ error, onRetry, className = '' }: ApiErrorDisplayProps) => {
  const isApiException = error instanceof ApiException;
  
  const getErrorMessage = () => {
    if (isApiException) {
      return error.apiError.message;
    }
    
    // Network errors
    if (error.message.includes('fetch')) {
      return 'ネットワークに接続できません。インターネット接続を確認してください。';
    }
    
    return error.message || '予期しないエラーが発生しました。';
  };

  const getErrorDetails = () => {
    if (isApiException && error.apiError.errors) {
      return Object.entries(error.apiError.errors).map(([field, messages]) => (
        <div key={field} className="mt-2">
          <span className="font-medium">{field}:</span>
          <ul className="list-disc list-inside ml-4">
            {messages.map((message, index) => (
              <li key={index} className="text-sm">{message}</li>
            ))}
          </ul>
        </div>
      ));
    }
    return null;
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            エラーが発生しました
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{getErrorMessage()}</p>
            {getErrorDetails()}
          </div>
          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-3 rounded-md text-sm transition-colors"
              >
                再試行
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};