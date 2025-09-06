import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, token, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: "",
    height: "",
    weight: "",
    preference: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ if API returns age/height/etc, merge with existing name/email
        setFormData({
          ...formData,
          ...res.data,
          name: res.data.name || user?.name || "",
          email: res.data.email || user?.email || "",
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("/users/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Profile updated successfully!");
      setFormData(res.data);

      // ✅ update global user too
      setUser(res.data);
    } catch (err) {
      setMessage("Error updating profile.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      {message && <p className="mb-3 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name || ""}
          onChange={handleChange}
          className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed"
          readOnly
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email || ""}
          onChange={handleChange}
          className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed"
          readOnly
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age || ""}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
        <input
          type="number"
          name="height"
          placeholder="Height (cm)"
          value={formData.height || ""}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
        <input
          type="number"
          name="weight"
          placeholder="Weight (kg)"
          value={formData.weight || ""}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
        <select
          name="preference"
          value={formData.preference || ""}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="">Select Preference</option>
          <option value="weight_loss">Weight Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="general_fitness">General Fitness</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
