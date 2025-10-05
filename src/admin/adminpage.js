import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './adminpage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

const AdminPage = () => {
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
                const adminResponse = await axios.get(`https://bidwiseralpha.onrender.com/api/getUserByEmail/${userId}`);
                setUsername(adminResponse.data.username);
            } catch (err) {
                console.error('Error fetching admin details:', err);
            }
        };
        fetchAdminDetails();
    }, [userId]);

    // Function to validate password
    const validatePassword = (password) => {
        // Your password validation logic here
        if (password.length < 8) {
            alert('Password must contain at least 8 characters.');
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            alert('Password must contain at least one uppercase letter.');
            return false;
          }
          // Password should contain at least one special character
          if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(password)) {
            alert('Password must contain at least one special character.');
            return false;
          }
          // Password should contain at least one digit
          if (!/\d/.test(password)) {
            alert('Password must contain at least one digit.');
            return false;
          }
        return true;
    };

    // Function to validate email
    const validateEmail = (email) => {
        if (!email.includes('@')) {
            alert('Invalid email format. Please enter a valid email.');
            return false;
        }
        return true;
    };

    const handleAddAdmin = () => {
        setShowAddAdminForm(true);
        setShowChangePasswordForm(false);
    };

    const handleChangePassword = () => {
        setShowAddAdminForm(false);
        setShowChangePasswordForm(true);
    };

    const addAdmin = async () => {
        try {
            if (!validateEmail(newAdminData.email)) return;
            if (!validatePassword(newAdminData.password)) return;

            const response = await axios.post('https://bidwiseralpha.onrender.com/api/addAdmin', newAdminData);
            setNewAdminData({ username: '', email: '', password: '' });
            alert(response.data.message);
            if(response.data.message ==='Email already exists in the database'){
                alert('Email already exists in the database');
            }
        } catch (error) {
            alert('Email already exists in the database');
            console.error('Error adding admin:', error);
        }
    };

    const changePassword = async () => {
        try {
            if (!validatePassword(changePasswordData.newPassword)) return;

            const response = await axios.post('https://bidwiseralpha.onrender.com/api/changePassword', {
                userId: userId,
                oldPassword: changePasswordData.oldPassword,
                newPassword: changePasswordData.newPassword
            });
            setChangePasswordData({ oldPassword: '', newPassword: '' });
            alert(response.data.message);
        } catch (error) {
            console.error('Error changing password:', error);
            alert("current entered password is incorrect");
        }
    };

    return (
        <div className="admin-page">
            <div className="sidebar">
                <div className='n-tag'>
                    <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
                    <strong style={{ wordWrap: "break-word" }}>{userId}</strong>
                </div>
                <div className="btns-g">
                    <button className="side-btn" onClick={handleAddAdmin}>Add New Admin</button>
                    <button className="side-btn" onClick={handleChangePassword}>Change Password</button>
                </div>
            </div>
            <div className="content">
                <div className="admin-details" style={{ border: "20px solid #3d3d4e", width: "1232px" }}>
                </div>
                {showAddAdminForm && (
                    <div className="content">
                        <div className="form-container" style={{ marginTop: "30px" }}>
                            <h3 className='headingadmin'>Add New Admin</h3>
                            <div className='forminput'>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={newAdminData.username}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                                />
                            </div>
                            <div className='forminput'>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newAdminData.email}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                                />
                            </div>
                            <div className='forminput'>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newAdminData.password}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                                />
                            </div>
                            <div className='addadminbtn'>
                                <button className='add-btn' onClick={addAdmin}>Add Admin</button>
                            </div>
                        </div>
                    </div>
                )}
                {showChangePasswordForm && (
                    <div className="form-container" style={{ marginTop: "30px" }}>
                        <h3 className='headingadmin'>Change Password</h3>
                        <div className='forminput'>
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
                        </div>
                        <div className='addadminbtn'>
                            <button className='ch-pass' onClick={changePassword}>Change Password</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
