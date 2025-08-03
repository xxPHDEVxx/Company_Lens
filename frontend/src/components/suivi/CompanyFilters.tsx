import React from 'react';

interface CompanyFiltersProps {
  filterStatus: 'all' | 'active' | 'inactive';
  setFilterStatus: React.Dispatch<React.SetStateAction<'all' | 'active' | 'inactive'>>;
  filterRegion: 'all' | 'flanders' | 'wallonia' | 'brussels';
  setFilterRegion: React.Dispatch<React.SetStateAction<'all' | 'flanders' | 'wallonia' | 'brussels'>>;
  sortBy: 'name' | 'followedSince' | 'lastUpdate';
  setSortBy: React.Dispatch<React.SetStateAction<'name' | 'followedSince' | 'lastUpdate'>>;
}

const CompanyFilters: React.FC<CompanyFiltersProps> = ({
  filterStatus,
  setFilterStatus,
  filterRegion,
  setFilterRegion,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Statut
        </label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>

      <div>
        <label htmlFor="regionFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Région
        </label>
        <select
          id="regionFilter"
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value as 'all' | 'flanders' | 'wallonia' | 'brussels')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Toutes les régions</option>
          <option value="flanders">Flandre</option>
          <option value="wallonia">Wallonie</option>
          <option value="brussels">Bruxelles-Capitale</option>
        </select>
      </div>

      <div>
        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
          Trier par
        </label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'followedSince' | 'lastUpdate')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="followedSince">Date de suivi</option>
          <option value="lastUpdate">Dernière mise à jour</option>
          <option value="name">Nom alphabétique</option>
        </select>
      </div>
    </div>
  );
};

export default CompanyFilters;