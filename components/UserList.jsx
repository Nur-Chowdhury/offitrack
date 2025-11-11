"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, User, Mail, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import AddUser from './AddUser';

const UserList = ({ orgId}) => {
    const { data: session } = useSession();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentUserMembership = useMemo(() => 
        members.find(member => member.user.id === session?.user?.id),
        [members, session]
    );
    const isAdmin = currentUserMembership?.role === "ADMIN";

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/org/${orgId}/members`);
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            } else {
                toast.error("Failed to fetch members.");
            }
        } catch (error) {
            console.error("Error fetching members:", error);
            toast.error("An error occurred while fetching members.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) {
            fetchMembers();
        }
    }, [orgId]);

    const handleAddSuccess = () => {
        toast.success('Member added successfully!');
        fetchMembers();
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`/api/org/${orgId}/members/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update role");
            }
            
            toast.success("User role updated!");
            fetchMembers();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredMembers = members.filter(member =>
        member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(orgId, "orgId in UserList");

    if (loading) {
        return <div className="p-8 w-full text-center">Loading members...</div>;
    }
    

    return (
        <div className="p-4 sm:p-6 md:p-8 w-full">
            <h1 className="text-2xl font-semibold mb-6">Organization Members</h1>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <input
                    type="text"
                    className="w-full sm:w-[300px] p-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isAdmin && (
                    <button
                        className="w-full sm:w-auto px-4 py-2 bg-blue-700 hover:bg-blue-600 text-sm rounded-lg cursor-pointer flex items-center justify-center gap-2 font-medium"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={16} />
                        Add Member
                    </button>
                )}
            </div>
            {filteredMembers.length === 0 ? (
                <p className="mt-8 text-gray-500 text-center">No members found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredMembers.map(({ user, role }) => (
                        <div key={user.id} className="p-4 border rounded-lg shadow-sm flex flex-col justify-between dark:bg-gray-950 dark:border-gray-700">
                            <div>
                                <h3 className="font-bold text-lg truncate">{user.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <Mail size={14} />
                                    <span className="truncate">{user.email}</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor={`role-${user.id}`} className="block mb-1 text-xs font-medium text-gray-500">ROLE</label>
                                <select
                                    id={`role-${user.id}`}
                                    value={role}
                                    disabled={!isAdmin || user.id === session?.user?.id}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    className="w-full p-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800 border-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="MAINTENANCE_STAFF">Maintenance Staff</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <AddUser
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAddSuccess}
                orgId={orgId}
            />
        </div>
    )
}

export default UserList
