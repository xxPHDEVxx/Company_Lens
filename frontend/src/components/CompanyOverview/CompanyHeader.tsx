import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

const CompanyHeader = () => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">Company Name</h3>
        <p className="text-sm text-gray-500">BE0123456789</p>
      </div>
    </div>
    <div className="flex space-x-2">
      <div className="px-3 py-1 bg-green-100 rounded-full">
        <span className="text-sm font-medium text-green-700">Active</span>
      </div>
    </div>
  </div>
);

export default CompanyHeader; 