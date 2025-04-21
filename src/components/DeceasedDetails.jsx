import { formatDate } from '../utils/helpers';

const DeceasedDetails = ({ deceased }) => {
  if (!deceased) {
    return (
      <div className="p-4 border rounded-md bg-gray-50">
        <p className="text-center text-gray-500">Nu au fost găsite informații</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md shadow-sm bg-white p-4">
      <h3 className="text-xl font-semibold mb-2">
        {deceased.first_name} {deceased.last_name}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-gray-600">
            <span className="font-semibold">Data nașterii:</span>{' '}
            {deceased.date_of_birth ? formatDate(deceased.date_of_birth) : 'Necunoscută'}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Data decesului:</span>{' '}
            {formatDate(deceased.date_of_death)}
          </p>
          {deceased.sector_name && (
            <p className="text-gray-600">
              <span className="font-semibold">Sector:</span> {deceased.sector_name}
            </p>
          )}
          {deceased.grave_number && (
            <p className="text-gray-600">
              <span className="font-semibold">Număr mormânt:</span> {deceased.grave_number}
            </p>
          )}
        </div>
        
        <div>
          {deceased.photo_url && (
            <div className="max-w-xs mx-auto">
              <img 
                src={deceased.photo_url} 
                alt={`${deceased.first_name} ${deceased.last_name}`} 
                className="w-full h-auto rounded-md shadow-sm"
              />
            </div>
          )}
        </div>
      </div>
      
      {deceased.details && (
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <h4 className="font-semibold mb-1">Detalii suplimentare</h4>
          <p className="text-gray-700">{deceased.details}</p>
        </div>
      )}
    </div>
  );
};

export default DeceasedDetails;