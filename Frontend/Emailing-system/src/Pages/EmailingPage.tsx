import React, { useState, useRef, useEffect } from "react";
import {
  Mail,
  Upload,
  Send,
  CheckCircle,
  FileSpreadsheet,
  Users,
  Trash2,
  Inbox,
  Search,
  Archive,
  Star,
  MoreHorizontal,
  Filter,
  RefreshCw,
  Menu,
  LogOut,
} from "lucide-react";
import axiosClient from "../axiosClient";
import { AxiosError } from "axios";
import { useAuth } from "../contexts/AuthContext";
// Note: axiosClient and AxiosError imports should be available in your project
// import axiosClient from "../axiosClient";
// import {

interface Recipient {
  email: string;
  name?: string;
  company?: string;
  application_code?: string;
  position?: string;
  remarks?: string;
  [key: string]: any;
}

interface EmailLog {
  id: string;
  application_code: string;
  name: string;
  email: string;
  position: string;
  remarks: string;
  created_at: Date;
}

interface MailingDashboardProps {}

const MailingDashboard: React.FC<MailingDashboardProps> = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"upload" | "logs">("upload");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [rawExcelData, setRawExcelData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendingProgress, setSendingProgress] = useState<number>(0);
  const [currentSendingEmail, setCurrentSendingEmail] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [filteredLogs, setFilteredLogs] = useState<EmailLog[]>([]);
  const [totalRecipientsCount, setTotalRecipientsCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock email logs data
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  function getCurrentFormattedDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return now.toLocaleDateString("en-US", options);
  }

  const deleteLog = async (application_id: string) => {
    try {
      await axiosClient.delete(`/emails/${application_id}`);
      alert("Log deleted successfully!");
    } catch (error) {
      alert("Error deleting event. Please try again.");
      console.error("Error deleting Log:", error);
    }
  };

  const handleDeleteLog = (application_id: string) => {
    if (confirm("Are you sure you want to delete this email log?")) {
      const updatedLogs = emailLogs.filter(
        (log) => log.application_code !== application_id
      );
      setEmailLogs(updatedLogs);
      deleteLog(application_id);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Send file to backend using FormData
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosClient.post("/upload-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("/upload-excel response:", response);
      setRawExcelData(response.data);

      // Map only the required fields for preview
      const mappedRecipients = response.data.map((item: any) => ({
        application_code: item.application_code,
        name: item.name,
        position: item.position,
        remarks: item.remarks,
        email: item.recipient,
        company: item.company,
      }));

      setRecipients(mappedRecipients);
      setTotalRecipientsCount(mappedRecipients.length);
    } catch (error) {
      alert(
        "Error uploading Excel file. Please ensure it contains an email column."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendEmails = async () => {
    setIsSending(true);
    setSendingProgress(0);

    // Create a copy of recipients to work with
    const recipientsCopy = [...recipients];

    // Simulate sending emails with progress and remove recipients as they're sent
    for (let i = 0; i < recipientsCopy.length; i++) {
      const recipient = recipientsCopy[i];
      const recipientData = rawExcelData[i];
      setCurrentSendingEmail(recipient.email);

      const payloadLogs = {
        application_code: recipientData.application_code,
        name: recipientData.name,
        email: recipientData.recipient,
        position: recipientData.position,
        remarks: recipientData.remarks,
      };

      const userAddress = recipientData.address.split(", ");

      const payload = {
        application_code: recipientData.application_code,
        position: recipientData.position,
        name: recipientData.name,
        sex: recipientData.sex,
        recipient: recipientData.recipient,
        date: getCurrentFormattedDate(),
        street: userAddress.length === 3 ? userAddress[1] : userAddress[0],
        city: userAddress.length === 3 ? userAddress[2] : userAddress[1],
        education_required: recipientData.education_required,
        education: recipientData.education,
        experience_required: recipientData.experience_required,
        experience: `${
          recipientData.experience_years === "NONE"
            ? ""
            : `(${recipientData.experience_years}) `
        }${
          recipientData.experience_detail === "NONE"
            ? "None"
            : recipientData.experience_detail
        }`,
        training_required: recipientData.training_required,
        training: `${
          recipientData.training_hours === "NONE"
            ? ""
            : `(${recipientData.training_hours}) `
        }${
          recipientData.training_title === "NONE"
            ? "None"
            : recipientData.training_title
        }`,
        eligibility_required: recipientData.eligibility_required,
        eligibility:
          recipientData.eligibility === "NONE"
            ? "None"
            : recipientData.eligibility,
        qualification: recipientData.remarks,
        education_remarks: recipientData.education_remarks,
        experience_remarks: recipientData.experience_remarks,
        training_remarks: recipientData.training_remarks,
        eligibility_remarks: recipientData.eligibility_remarks,
        performance: recipientData.performance,
        performance_required: recipientData.performance_required,
      };
      try {
        const response = await axiosClient.post("/send-email", payload);
        const respLogs = await axiosClient.post("/add_to_log", payloadLogs);
        console.log("✅ Response:", response.data);
      } catch (error: unknown) {
        const err = error as AxiosError<{ error: string }>;
        if (err.response) {
          console.error("❌ Error:", err.response.data.error);
        } else {
          console.error("❌ Error:", err.message);
        }
      } finally {
        setRecipients((prev) => prev.filter((_, index) => index !== 0));
        const progress = ((i + 1) / recipientsCopy.length) * 100;
        setSendingProgress(progress);
      }
    }

    setIsSending(false);
    setSendingProgress(0);
    setCurrentSendingEmail("");
    alert(`Successfully sent ${recipientsCopy.length} emails!`);
    // Clear file input and reset states
    if (fileInputRef.current) fileInputRef.current.value = "";
    setRecipients([]);
    setRawExcelData([]);
    setTotalRecipientsCount(0);
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await logout();
        // The AuthContext will handle the redirect to login page
      } catch (error) {
        console.error("Error during logout:", error);
        alert("Error logging out. Please try again.");
      }
    }
  };

  const filterLogsByDate = () => {
    let filtered = emailLogs;

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate <= toDate;
      });
    }

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    filterLogsByDate();
  }, [emailLogs]);

  const fetchLogs = async () => {
    try {
      const response = await axiosClient.get("/emails");
      setEmailLogs(response.data.emails.data ? response.data.emails.data : []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") fetchLogs();
  }, [activeTab]);

  React.useEffect(() => {
    filterLogsByDate();
  }, [dateFrom, dateTo, emailLogs]);

  // Empty state component for recipients
  const EmptyRecipientsState = () => (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No recipients loaded
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Upload an Excel file with recipient information to start your email
          campaign.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gmail-style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-medium text-gray-900">
                  Deped Cadiz
                </h1>
              </div>
            </div>

            {/* Search Bar (Gmail-style) */}
            {/* <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mail"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </div> */}

            <div className="flex items-center space-x-2">
              {currentUser && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {currentUser.displayName?.charAt(0) ||
                            currentUser.email?.charAt(0) ||
                            "U"}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-700 hidden md:block">
                      {currentUser.displayName || currentUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Gmail-style Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={() => setActiveTab("upload")}
              className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "upload"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Upload className="w-5 h-5 mr-3" />
              Compose Campaign
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "logs"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Inbox className="w-5 h-5 mr-3" />
              Email Logs
            </button>
          </div>

          {/* Sidebar Stats */}
          <div className="px-4 py-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">STATISTICS</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Recipients</span>
                <span className="font-medium">{totalRecipientsCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Email Logs</span>
                <span className="font-medium">{emailLogs.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Campaign Builder Tab */}
          {activeTab === "upload" && (
            <div className="p-6 space-y-6">
              {/* Upload Section */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
                    Upload Recipients
                  </h2>
                </div>

                <div className="p-6">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Upload Excel File
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Drop your Excel file here or click to browse
                    </p>

                    <button
                      disabled={isUploading}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </button>
                  </div>

                  {totalRecipientsCount > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center text-blue-700">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">
                          {totalRecipientsCount} recipients loaded
                          {recipients.length !== totalRecipientsCount &&
                            ` (${recipients.length} remaining)`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipients Section */}
              {totalRecipientsCount === 0 ? (
                <EmptyRecipientsState />
              ) : (
                <div className="bg-white rounded-lg border border-gray-200">
                  {/* Header with Send Button */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Recipients ({recipients.length})
                        {recipients.length !== totalRecipientsCount && (
                          <span className="ml-2 text-sm text-gray-500">
                            of {totalRecipientsCount} total
                          </span>
                        )}
                      </h2>

                      <button
                        onClick={handleSendEmails}
                        disabled={isSending || recipients.length === 0}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSending ? "Sending..." : "Send Emails"}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {isSending && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Sending to: {currentSendingEmail}</span>
                          <span>{Math.round(sendingProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${sendingProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recipients Grid */}
                  <div className="p-6">
                    {recipients.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          All Emails Sent!
                        </h3>
                        <p className="text-gray-500">
                          All recipients have been successfully processed.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recipients.map((recipient, index) => (
                          <div
                            key={`${recipient.email}-${index}`}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {recipient.application_code}
                              </span>
                              <Mail className="w-4 h-4 text-gray-400" />
                            </div>

                            {/* Name and Position */}
                            <div className="mb-3">
                              <h3 className="font-medium text-gray-900 mb-1">
                                {recipient.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {recipient.position}
                              </p>
                            </div>

                            {/* Company */}
                            {recipient.company && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600">
                                  {recipient.company}
                                </p>
                              </div>
                            )}

                            {/* Email */}
                            <div className="mb-3">
                              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                                <Mail className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="text-xs text-gray-700 truncate">
                                  {recipient.email}
                                </span>
                              </div>
                            </div>

                            {/* Remarks */}
                            {recipient.remarks && (
                              <div className="pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 italic">
                                  "{recipient.remarks}"
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Logs Tab */}
          {activeTab === "logs" && (
            <div className="p-6">
              <div className="bg-white rounded-lg border border-gray-200">
                {/* Header with Filters */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Inbox className="w-5 h-5 mr-2 text-blue-600" />
                      Email Logs
                    </h2>

                    {/* Date Filters */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          From:
                        </label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          To:
                        </label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setDateFrom("");
                          setDateTo("");
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="mt-3 text-sm text-gray-600">
                    Showing {filteredLogs.length} of {emailLogs.length} records
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Application Code
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLogs.length > 0 ? (
                        filteredLogs.map((log, index) => (
                          <tr
                            key={log.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {log.application_code}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {log.name}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {log.email}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {log.position}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500">
                              <div>
                                {new Date(log.created_at).toLocaleDateString(
                                  "en-PH",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    timeZone: "Asia/Manila",
                                  }
                                )}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(log.created_at).toLocaleTimeString(
                                  "en-PH",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                    timeZone: "Asia/Manila",
                                  }
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">
                              {log.remarks}
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() =>
                                  handleDeleteLog(log.application_code)
                                }
                                className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete log"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center">
                            <div className="flex flex-col items-center">
                              <Archive className="w-12 h-12 text-gray-300 mb-4" />
                              <p className="text-gray-500">
                                No records found for the selected date range
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailingDashboard;
