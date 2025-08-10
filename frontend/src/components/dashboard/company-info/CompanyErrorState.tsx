interface CompanyErrorStateProps {
  error: string | null;
}

const CompanyErrorState: React.FC<CompanyErrorStateProps> = ({ error }) => {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600">{error || 'Impossible de charger les données de l\'entreprise'}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyErrorState;