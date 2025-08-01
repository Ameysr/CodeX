import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

const AdminPromoManager = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/userPromo/admin/promos');
      setPromos(data.promos || []);
    } catch (err) {
      setError('Failed to fetch promotions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotion? This action cannot be undone!')) return;
    
    try {
      await axiosClient.delete(`/userPromo/admin/promos/${id}`);
      setPromos(promos.filter(promo => promo._id !== id));
    } catch (err) {
      setError('Failed to delete promotion');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (promo) => {
    const now = new Date();
    if (promo.moderationStatus === 'rejected') {
      return <span className="badge badge-error">Rejected</span>;
    }
    if (promo.expiresAt < now) {
      return <span className="badge badge-warning">Expired</span>;
    }
    if (promo.isApproved && promo.isActive) {
      return <span className="badge badge-success">Active</span>;
    }
    return <span className="badge badge-info">Pending</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4 max-w-2xl mx-auto">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Promotions</h1>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="w-1/12">#</th>
              <th className="w-2/12">Title</th>
              <th className="w-1/12">Slot</th>
              <th className="w-2/12">User</th>
              <th className="w-2/12">Created</th>
              <th className="w-2/12">Expires</th>
              <th className="w-1/12">Clicks</th>
              <th className="w-1/12">Status</th>
              <th className="w-2/12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.length > 0 ? (
              promos.map((promo, index) => (
                <tr key={promo._id} className="hover">
                  <th>{index + 1}</th>
                  <td>
                    <div className="font-bold">{promo.title}</div>
                    <div className="text-xs text-gray-500">{promo.description.substring(0, 30)}...</div>
                  </td>
                  <td>
                    <span className={`badge ${promo.slot === 1 ? 'badge-primary' : promo.slot === 2 ? 'badge-secondary' : 'badge-accent'}`}>
                      {promo.slotType}
                    </span>
                  </td>
                  <td>
                    {promo.userId?.firstName} {promo.userId?.lastName}
                    <div className="text-xs">{promo.userId?.email}</div>
                  </td>
                  <td>{formatDate(promo.createdAt)}</td>
                  <td>{formatDate(promo.expiresAt)}</td>
                  <td className="text-center">{promo.clicks || 0}</td>
                  <td>{getStatusBadge(promo)}</td>
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDelete(promo._id)}
                        className="btn btn-sm btn-error"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-8">
                  <div className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No promotions found. Create your first promotion!
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromoManager;