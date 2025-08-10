const regionLabels = {
  flanders: 'Flandre',
  wallonia: 'Wallonie',
  brussels: 'Bruxelles-Capitale',
};

export const getStatusBadge = (status: 'active' | 'inactive') => {
  return status === 'active' ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Actif
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      Inactif
    </span>
  );
};

export const getRegionBadge = (region: 'flanders' | 'wallonia' | 'brussels') => {
  const colors = {
    flanders: 'bg-yellow-100 text-yellow-800',
    wallonia: 'bg-red-100 text-red-800',
    brussels: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[region]}`}>
      {regionLabels[region]}
    </span>
  );
};