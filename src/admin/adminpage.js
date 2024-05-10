import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './adminpage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'; // Importing the user-circle icon


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
            alert("current entered password is incorrect");
        }
    };
    

    return (
            <div className="admin-page">
                <div className="sidebar">
                    <div  className='n-tag' >
                    <FontAwesomeIcon icon={faUserCircle} className="user-icon" /> {/* Using the faUserCircle icon */}
                    <strong style={{wordWrap: "break-word"}}>{userId}</strong>
                    </div>
                    <div className="btns-g" >
                        <button className="side-btn"onClick={handleAddAdmin}>Add New Admin</button>
                        <button className="side-btn" onClick={handleChangePassword}>Change Password</button>
                    </div>
                </div>
                <div className="content">
                    <div className="admin-details" style={{border:"20px solid #3d3d4e", width:"1232px"}}>
                    </div>
                    {showAddAdminForm && (
                        <div className="content">
                        <div className="form-container" style={{marginTop:"30px"}}>
                            <h3  className='headingadmin'>Add New Admin</h3>
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
                        <div className="form-container"  style={{marginTop:"30px"}}>
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