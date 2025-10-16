interface VatNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  error?: string;
}

const VatNumberInput: React.FC<VatNumberInputProps> = ({
  value,
  onChange,
  onSearch,
  isSearching,
  error
}) => {
  const handleClear = () => {
    onChange('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-2">
        Numéro de TVA *
      </label>
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              id="vatNumber"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: BE0123456789 ou 0123456789"
              className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Effacer le numéro de TVA"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>
        <SearchButton
          onClick={onSearch}
          isSearching={isSearching}
          disabled={isSearching || !value.trim()}
        />
      </div>
    </div>
  );
};

interface SearchButtonProps {
  onClick: () => void;
  isSearching: boolean;
  disabled: boolean;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick, isSearching, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
  >
    {isSearching ? (
      <>
        <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Recherche...
      </>
    ) : (
      <>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Rechercher
      </>
    )}
  </button>
);

export default VatNumberInput;