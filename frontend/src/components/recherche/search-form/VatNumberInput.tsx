interface VatNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

const VatNumberInput: React.FC<VatNumberInputProps> = ({
  value,
  onChange,
  onSearch,
  isSearching
}) => {
  return (
    <div className="mb-6">
      <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-2">
        Numéro de TVA *
      </label>
      <div className="flex gap-3">
        <input
          type="text"
          id="vatNumber"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: BE0123456789 ou 0123456789"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
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