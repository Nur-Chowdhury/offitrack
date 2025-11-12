"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Clock, CheckCircle, Calendar, MapPin, Link as LinkIcon, List, Trash2, LogOut, Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import AddResource from './AddResource';
import BookResource from './BookResource';
import BookingManager from './BookingManager';
import ReportIssue from './ReportIssue';
import MyBookings from './MyBookings';

const StatusTag = ({ statusInfo }) => {
    const isAvailable = statusInfo.status === 'Available';
    const bgColor = isAvailable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    const Icon = isAvailable ? CheckCircle : Clock;
    return (<span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${bgColor}`}><Icon size={14} />{statusInfo.status}</span>);
};

const ResourceList = ({ orgId }) => {
    const { data: session } = useSession();
    const [resources, setResources] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [resourceToBook, setResourceToBook] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [isMyBookingsModalOpen, setIsMyBookingsModalOpen] = useState(false);
    const [itemToReport, setItemToReport] = useState(null);

    const currentUserMembership = useMemo(() => members.find(m => m.user.id === session?.user?.id), [members, session]);
    const isAdmin = currentUserMembership?.role === "ADMIN";

    const fetchData = async () => {
        try {
            const [resourcesRes, bookingsRes, membersRes] = await Promise.all([
                fetch(`/api/org/${orgId}/resources`),
                fetch(`/api/org/${orgId}/bookings`),
                fetch(`/api/org/${orgId}/members`),
            ]);
            if (!resourcesRes.ok || !bookingsRes.ok || !membersRes.ok) { throw new Error("Failed to fetch all required data."); }
            const resourcesData = await resourcesRes.json();
            const bookingsData = await bookingsRes.json();
            const membersData = await membersRes.json();
            setResources(resourcesData);
            setBookings(bookingsData);
            setMembers(membersData);
        } catch (error) {
            console.error("Error fetching resource data:", error);
            toast.error(error.message || "An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) {
            setLoading(true);
            fetchData();
        }
    }, [orgId]);

    const getResourceStatus = (resourceId) => {
        const now = new Date();
        const activeBooking = bookings.find(b =>
            b.resourceId === resourceId &&
            ['APPROVED', 'IN_USE'].includes(b.status) &&
            new Date(b.startTime) <= now &&
            new Date(b.endTime) > now
        );
        return activeBooking
            ? { status: 'In Use', user: activeBooking.user.name, userId: activeBooking.userId, bookingId: activeBooking.id }
            : { status: 'Available' };
    };

    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm("Are you sure you want to delete this resource and all its associated bookings? This action cannot be undone.")) return;
        try {
            const response = await fetch(`/api/org/${orgId}/resources/${resourceId}`, { method: 'DELETE' });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to delete resource.");
            }
            toast.success("Resource deleted successfully!");
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleReleaseBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to end this booking early and release the resource?")) return;
        try {
            const response = await fetch(`/api/org/${orgId}/bookings/${bookingId}/release`, { method: 'PUT' });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to release booking.");
            }
            toast.success("Booking ended and resource released!");
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const pendingRequestCount = useMemo(() => bookings.filter(b => b.status === 'PENDING').length, [bookings]);
    const myBookings = useMemo(() => bookings.filter(b => b.userId === session?.user?.id), [bookings, session]);

    if (loading) return <div className="p-8 w-full text-center">Loading resources...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 w-full bg-white dark:bg-black">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-semibold">Resource Booking</h1>
                <div className="flex items-center gap-2">
                    {isAdmin ? (
                        <button onClick={() => setIsManagerModalOpen(true)} className="px-4 py-2 text-sm font-medium border rounded-lg flex items-center gap-2 relative hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600">
                            <List size={16}/> Manage Requests
                            {pendingRequestCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{pendingRequestCount}</span>}
                        </button>
                    ) : (
                        <button onClick={() => setIsMyBookingsModalOpen(true)} className="px-4 py-2 text-sm font-medium border rounded-lg flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600">
                            <Calendar size={16}/> My Bookings
                        </button>
                    )}
                    {isAdmin && <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-600 rounded-lg flex items-center gap-2"><Plus size={16}/> New Resource</button>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {resources.map((resource) => {
                    const statusInfo = getResourceStatus(resource.id);
                    const isCurrentUserBooked = statusInfo.userId === session?.user?.id;
                    const isAvailableForBooking = ['GOOD', 'NEW', 'USED'].includes(resource.condition);

                    return (
                        <div key={resource.id} className="p-4 border rounded-lg shadow-sm flex flex-col justify-between dark:bg-gray-950 dark:border-gray-700">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg truncate pr-2">{resource.name}</h3>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {isAdmin && <button onClick={() => handleDeleteResource(resource.id)} className="p-1 text-gray-400 hover:text-red-500" title="Delete Resource"><Trash2 size={16}/></button>}
                                        <button onClick={() => setItemToReport({ id: resource.id, name: resource.name, isAsset: false })} className="p-1 text-gray-400 hover:text-orange-500" title="Report Issue"><AlertTriangle size={16}/></button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{resource.category}</p>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                                    <p className="capitalize flex items-center gap-2"><strong>Type:</strong> {resource.type.toLowerCase()}</p>
                                    
                                    {resource.type === 'PHYSICAL' && resource.location && (
                                        <div className="flex items-center gap-2"><MapPin size={14}/> <span>{resource.location}</span></div>
                                    )}

                                    {resource.type === 'VIRTUAL' && resource.url && (
                                        isCurrentUserBooked ? (
                                            <div className="flex items-center gap-2">
                                                <LinkIcon size={14}/>
                                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">{resource.url}</a>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400 italic">
                                                <Lock size={14}/>
                                                <span>Link available during your booking</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t dark:border-gray-700 flex justify-between items-center">
                                <StatusTag statusInfo={statusInfo} />
                                {statusInfo.status === 'Available' && isAvailableForBooking && <button onClick={() => setResourceToBook(resource)} className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-1.5"><Calendar size={14}/> {isAdmin ? "Book for Self" : "Book Now"}</button>}
                                {statusInfo.status === 'Available' && !isAvailableForBooking && <span className="text-xs font-bold text-red-500 flex items-center gap-1.5"><AlertTriangle size={14}/>Under Maintenance</span>}
                                {statusInfo.status === 'In Use' && (isCurrentUserBooked || isAdmin) && <button onClick={() => handleReleaseBooking(statusInfo.bookingId)} className="px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 flex items-center gap-1.5"><LogOut size={14}/> End Booking</button>}
                            </div>
                        </div>
                    );
                })}
            </div>

            <AddResource isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchData} orgId={orgId} />
            {resourceToBook && <BookResource isAdmin={isAdmin} isOpen={true} onClose={() => setResourceToBook(null)} onSuccess={fetchData} orgId={orgId} resource={resourceToBook} />}
            {isAdmin && <BookingManager isOpen={isManagerModalOpen} onClose={() => setIsManagerModalOpen(false)} onSuccess={fetchData} orgId={orgId} bookings={bookings} />}
            {!isAdmin && <MyBookings isOpen={isMyBookingsModalOpen} onClose={() => setIsMyBookingsModalOpen(false)} onSuccess={fetchData} orgId={orgId} myBookings={myBookings} />}
            {itemToReport && <ReportIssue isOpen={true} onClose={() => setItemToReport(null)} onSuccess={fetchData} orgId={orgId} item={itemToReport} />}
        </div>
    );
};
export default ResourceList;