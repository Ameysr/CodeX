import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

const AdminDeleteContest = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/contest/fetchAll');
      setContests(data.contests || []);
    } catch (err) {
      setError('Failed to fetch contests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contest? All related data will be permanently removed!')) return;
    
    try {
      await axiosClient.delete(`/contest/delete/${id}`);
      setContests(contests.filter(contest => contest._id !== id));
    } catch (err) {
      setError('Failed to delete contest');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
        <h1 className="text-3xl font-bold">Manage Contests</h1>
        <button 
          onClick={() => navigate('/admin/contest')}
          className="btn btn-primary"
        >
          Create New Contest
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="w-1/12">#</th>
              <th className="w-3/12">Title</th>
              <th className="w-2/12">Start Date</th>
              <th className="w-2/12">End Date</th>
              <th className="w-1/12">Problems</th>
              <th className="w-3/12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contests.length > 0 ? (
              contests.map((contest, index) => (
                <tr key={contest._id} className="hover">
                  <th>{index + 1}</th>
                  <td>{contest.title}</td>
                  <td>{formatDate(contest.startDate)}</td>
                  <td>{formatDate(contest.endDate)}</td>
                  <td className="text-center">{contest.problems?.length || 0}</td>
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDelete(contest._id)}
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
                <td colSpan="6" className="text-center py-8">
                  <div className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No contests found. Create your first contest!
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

export default AdminDeleteContest;