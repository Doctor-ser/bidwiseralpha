import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './footer';

const AdminPage = () => {

    // useEffect(()=>{

    //     window.location.reload();
    //   },[]);
    const [username, setUsername] = useState('');
    const { userId } = useAuth();
    const [newAdminData, setNewAdminData] = useState({ username: '', email: '', password: '' });
    const [changePasswordData, setChangePasswordData] = useState({ oldPassword: '', newPassword: '' });
    const [showAddAdminForm, setShowAddAdminForm] = useState(false);
    const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminDetails = async () => {
            try {
                const adminResponse = await axios.get(`http://127.0.0.1:5500/api/getUserByEmail/${userId}`);
                setUsername(adminResponse.data.username);
            } catch (err) {
                console.error('Error fetching admin details:', err);
            }
        };
        fetchAdminDetails();
    }, [userId]);

    const handleAddAdmin = async () => {
        setShowAddAdminForm(true);
        setShowChangePasswordForm(false);
    };

    const handleChangePassword = async () => {
        setShowAddAdminForm(false);
        setShowChangePasswordForm(true);
    };

    const addAdmin = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5500/api/addAdmin', newAdminData);
            // Optionally, you can reset the form fields after successful addition
            setNewAdminData({ username: '', email: '', password: '' });
            // Display the response message in an alert
            alert(response.data.message);
        } catch (error) {
            console.error('Error adding admin:', error);
            // Optionally, you can show an error message to the user
        }
    };
    

    const changePassword = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5500/api/changePassword', {
                userId: userId,
                oldPassword: changePasswordData.oldPassword,
                newPassword: changePasswordData.newPassword
            });
            // Optionally, you can reset the form fields after successful password change
            setChangePasswordData({ oldPassword: '', newPassword: '' });
            // Display the response message in an alert
            alert(response.data.message);
        } catch (error) {
            console.error('Error changing password:', error);
            // Optionally, you can show an error message to the user
        }
    };
    

    return (
        <div>
            
            <div className="admin-page">
                <div className="sidebar">
                    <h2>Admin Actions</h2>
                    <button onClick={handleAddAdmin}>Add New Admin</button>
                    <button onClick={handleChangePassword}>Change Password</button>
                </div>
                <div className="content">
                    <div className="admin-details">
                        <h2>Admin Details</h2>
                        <ul>
                            <li>YOUR Name: <strong>{username}</strong></li>
                            <br />
                            <li>YOUR Email: <strong>{userId}</strong></li>
                        </ul>
                    </div>
                    {showAddAdminForm && (
                        <div className="form-container">
                            <h3>Add New Admin</h3>
                            <input
                                type="text"
                                placeholder="Username"
                                value={newAdminData.username}
                                onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={newAdminData.email}
                                onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={newAdminData.password}
                                onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                            />
                            <button onClick={addAdmin}>Add Admin</button>
                        </div>
                    )}
                    {showChangePasswordForm && (
                        <div className="form-container">
                            <h3>Change Password</h3>
                            <input
                                type="password"
                                placeholder="Old Password"
                                value={changePasswordData.oldPassword}
                                onChange={(e) => setChangePasswordData({ ...changePasswordData, oldPassword: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={changePasswordData.newPassword}
                                onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                            />
                            <button onClick={changePassword}>Change Password</button>
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
};

export default AdminPage;
