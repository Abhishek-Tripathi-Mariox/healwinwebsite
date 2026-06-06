import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Phone,
  Mail,
  Building2,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

const TeamVerifyPage = () => {
  const { uniqueId } = useParams();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch(`/team/verify/${uniqueId}`);
        if (data.success && data.data) {
          setMember(data.data);
        } else {
          setError(data.message || "Team member not found");
        }
      } catch {
        setError("Unable to verify. Please check the link and try again.");
      } finally {
        setLoading(false);
      }
    };
    if (uniqueId) fetchMember();
  }, [uniqueId]);

  return (
    <div className="min-h-screen bg-hw-base pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          to="/team"
          className="inline-flex items-center gap-1.5 text-sm text-hw-muted hover:text-hw-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </Link>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Loader2 className="w-10 h-10 animate-spin text-hw-primary mx-auto mb-4" />
            <p className="text-hw-muted">Verifying team member...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 premium-card rounded-2xl"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-hw-text mb-2">
              Verification Failed
            </h2>
            <p className="text-hw-muted mb-6">{error}</p>
            <Link to="/team">
              <Button variant="outline" className="rounded-xl">
                View Our Team
              </Button>
            </Link>
          </motion.div>
        ) : member ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card rounded-2xl overflow-hidden"
          >
            {/* Verified badge header */}
            <div className="bg-gradient-to-r from-emerald-500 to-hw-primary p-5 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-2">
                <Shield className="w-4 h-4" />
                Verified Team Member
              </div>
              <div className="flex items-center justify-center mt-3">
                <CheckCircle className="w-6 h-6 text-white mr-2" />
                <span className="text-lg font-bold text-white">
                  HealWin Authenticated
                </span>
              </div>
            </div>

            {/* Member Profile */}
            <div className="p-6 text-center">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-emerald-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-hw-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-hw-primary" />
                </div>
              )}

              <h2 className="text-xl font-bold text-hw-text">{member.name}</h2>
              {member.designation && (
                <p className="text-hw-primary font-medium mt-1">
                  {member.designation}
                </p>
              )}
              {member.department && (
                <p className="text-sm text-hw-muted mt-0.5">
                  {member.department}
                </p>
              )}

              <div className="mt-5 space-y-3 text-left">
                {member.uniqueId && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Shield className="w-5 h-5 text-hw-primary shrink-0" />
                    <div>
                      <p className="text-xs text-hw-muted">Employee ID</p>
                      <p className="text-sm font-semibold text-hw-text">
                        {member.uniqueId}
                      </p>
                    </div>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-hw-primary shrink-0" />
                    <div>
                      <p className="text-xs text-hw-muted">Email</p>
                      <p className="text-sm font-medium text-hw-text">
                        {member.email}
                      </p>
                    </div>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-hw-primary shrink-0" />
                    <div>
                      <p className="text-xs text-hw-muted">Phone</p>
                      <p className="text-sm font-medium text-hw-text">
                        {member.phone}
                      </p>
                    </div>
                  </div>
                )}
                {(member.state || member.city) && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Building2 className="w-5 h-5 text-hw-primary shrink-0" />
                    <div>
                      <p className="text-xs text-hw-muted">Location</p>
                      <p className="text-sm font-medium text-hw-text">
                        {[member.city, member.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs text-hw-muted">
                  This person is a verified member of the HealWin team.
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default TeamVerifyPage;
