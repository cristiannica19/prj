import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Sistem de administrare a cimitirului
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Aici puteți explora harta cimitirului și găsi informații despre persoanele decedate.
          </p>
    
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-primary mb-3">Hartă interactivă</h2>
            <p className="text-gray-600 mb-4">
              Explorați harta interactivă a cimitirului pentru a vizualiza sectoarele și mormintele.
            </p>
            <Link to="/harta" className="text-primary hover:underline font-medium">
              Accesează harta →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-primary mb-3">Căutare persoane</h2>
            <p className="text-gray-600 mb-4">
              Căutați informații despre persoanele decedate folosind numele sau alte detalii.
            </p>
            <Link to="/persoane" className="text-primary hover:underline font-medium">
              Caută persoane →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-primary mb-3">Informații generale</h2>
            <p className="text-gray-600 mb-4">
              Aflați mai multe despre serviciile oferite și istoricul cimitirului.
            </p>
            <a href="#info" className="text-primary hover:underline font-medium">
              Află mai multe →
            </a>
          </div>
        </div>

        {/* About Section */}
        <div id="info" className="bg-gray-50 p-4 rounded-lg mb-12">
          <h2 className="text-2xl font-bold text-primary mb-4">Despre cimitir</h2>
          <p className="text-gray-700 mb-4">
            Cimitirul nostru oferă un loc de odihnă liniștit pentru cei dragi. Întins pe o suprafață
            generoasă, cimitirul este împărțit în mai multe sectoare, fiecare cu specificul său.
          </p>
          <p className="text-gray-700 mb-4">
            Sistemul nostru de administrare vă permite să localizați mormintele și să aflați
            informații despre persoanele decedate, făcând mai ușoară vizitarea și îngrijirea
            mormintelor.
          </p>
          <p className="text-gray-700">
            Pentru mai multe informații sau asistență, vă rugăm să contactați administrația
            cimitirului la numărul de telefon: <strong>0123 456 789</strong> sau prin email la{' '}
            <strong>contact@cimitir.ro</strong>.
          </p>
        </div>

        {/* Contact/Service Hours Section */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Program și servicii</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Program de vizitare</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Luni - Vineri:</strong> 08:00 - 20:00</li>
                <li><strong>Sâmbătă - Duminică:</strong> 08:00 - 22:00</li>
                <li><strong>Sărbători legale:</strong> 09:00 - 18:00</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">Servicii disponibile</h3>
              <ul className="space-y-2 text-gray-700">
                <li>Întreținere morminte</li>
                <li>Aranjamente florale</li>
                <li>Servicii de comemorare</li>
                <li>Asistență pentru înmormântări</li>
                <li>Consultanță și suport</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;