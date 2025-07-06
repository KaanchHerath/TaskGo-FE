import { useEffect, useState } from 'react';
import { getUserProfile } from '../services/api/profileService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not logged in');
          setLoading(false);
          return;
        }
        const data = await getUserProfile();
        setUser(data);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-8 mt-16">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      <div className="space-y-4">
        <div><span className="font-semibold">Full Name:</span> {user.fullName}</div>
        <div><span className="font-semibold">Email:</span> {user.email}</div>
        <div><span className="font-semibold">Role:</span> {user.role}</div>
        {user.taskerProfile && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Tasker Profile</h3>
            <div><span className="font-semibold">Skills:</span> {user.taskerProfile.skills?.join(', ')}</div>
            <div><span className="font-semibold">Country:</span> {user.taskerProfile.country}</div>
            <div><span className="font-semibold">Area:</span> {user.taskerProfile.area}</div>
            <div><span className="font-semibold">ID Document:</span> {user.taskerProfile.idDocument && <a href={user.taskerProfile.idDocument} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>}</div>
            {user.taskerProfile.qualificationDocuments && user.taskerProfile.qualificationDocuments.length > 0 && (
              <div><span className="font-semibold">Qualification Documents:</span> {user.taskerProfile.qualificationDocuments.map((doc, idx) => (
                <a key={doc} href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">Doc {idx + 1}</a>
              ))}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 