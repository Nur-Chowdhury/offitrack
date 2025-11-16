"use client";

import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import CreateOrg from "@/components/CreateOrg";
import { toast } from "react-toastify";
import Link from "next/link";
import { useUnseenNotifications } from "@/hooks/useUnseenNotifications";

const OrganizationCard = ({ org }) => {
  const { count } = useUnseenNotifications(org.id);
  return (
    <Link href={`/dashboard/org/${org.id}`} className="group block">
      <div
        className=" w-[250px] p-4 border rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-950 dark:border-gray-700
                hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md dark:shadow-gray-500"
      >
        <div className=" flex justify-between">
          <h3 className="font-semibold">{org.name}</h3>
          <ChevronRight
            size={24}
            className="transition-transform duration-200 ease-in-out group-hover:translate-x-1 group-hover:scale-125"
          />
        </div>
        <span className=" text-sm text-gray-700 dark:text-gray-300">
          Role: {org.role}
        </span>
        <div className="w-full mt-4 text-center text-md text-blue-500 font-semibold">
          {count} New Notifications
        </div>
      </div>
    </Link>
  );
};

const page = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [create, setCreate] = useState(false);

  const fetchOrganizations  = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/org/search?search=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok)
        throw new Error("Failed to fetch initial organization data.");
      const orgs = await response.json();
      setOrganizations(orgs);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => fetchOrganizations(), 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className=" pt-20 lg:pt-28 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleCreationSuccess = () => {
    toast.success("Organization created successfully!");
    fetchOrganizations();
  };

  return (
    <div className="">
      <Navbar />
      <div className=" pt-20 lg:pt-28 w-full px-[10%] h-screen flex flex-col gap-4">
        <h1 className=" text-2xl font-semibold ">Organizations</h1>
        <div className=" flex items-center justify-between mt-8">
          <input
            type="text"
            id="search"
            className="w-[250px] p-1 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600  rounded-lg 
            bg-gray-50 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500   dark:placeholder-gray-400"
            placeholder="Search Organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className=" px-2 py-0.5 bg-green-700 hover:bg-green-600 text-sm rounded-lg cursor-pointer flex items-center
           justify-center gap-0.5 font-medium"
            onClick={() => setCreate(true)}
          >
            <Plus size={15} />
            New Organization
          </button>
        </div>
        {organizations.length === 0 ? (
          <p className=" mt-8 text-gray-500 text-center">
            No organizations found.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-4">
            {organizations.map((org) => (
              <OrganizationCard org={org} key={org.id} />
            ))}
          </div>
        )}
      </div>
      <CreateOrg
        isOpen={create}
        onClose={() => setCreate(false)}
        onSuccess={handleCreationSuccess}
      />
    </div>
  );
};

export default page;
