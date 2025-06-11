import { useRef, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";

const Updates = () => {
  const [formData, setFormData] = useState({
    date: "",
    category: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const dateInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.category) newErrors.category = "Category is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log("Submitted:", formData);
    setFormData({ date: "", category: "", description: "" });
    setErrors({});
  };

  const openDatePicker = () => {
    dateInputRef.current?.showPicker(); // triggers native calendar
  };

  return (
    <div className="min-h-screen bg-[#0B0E17] text-white p-6 flex items-center justify-center">
      <div className="p-8 rounded-2xl w-full max-w-xl shadow-xl bg-[#0F1629]">
        <h2 className="text-3xl font-bold mb-8 font-sans">Updates</h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 font-sans">
              Date
            </label>
            <div
              className={`relative w-full rounded-md bg-[#1A1F2E] cursor-pointer ${
                errors.date
                  ? "ring-2 ring-red-500"
                  : "focus-within:ring-2 focus-within:ring-blue-500"
              }`}
              onClick={openDatePicker}
            >
              <FaRegCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <div className="pl-12 pr-4 py-3 text-white font-sans">
                {formData.date || (
                  <span className="text-gray-500">
                    Enter Your Year - Month - Date
                  </span>
                )}
              </div>

              <input
                type="date"
                name="date"
                ref={dateInputRef}
                value={formData.date}
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 font-sans">
              Select Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-md bg-[#1A1F2E] text-white font-sans focus:outline-none focus:ring-2 ${
                errors.category ? "ring-red-500" : "focus:ring-blue-500"
              }`}
            >
              <option disabled value="">
                Select Category
              </option>
              <option value="General">General</option>
              <option value="Feature">Feature</option>
              <option value="Bug Fix">Bug Fix</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2 font-sans">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter Your Description"
              className={`w-full px-4 py-3 rounded-md bg-[#1A1F2E] text-white placeholder-gray-500 font-sans resize-none focus:outline-none focus:ring-2 ${
                errors.description ? "ring-red-500" : "focus:ring-blue-500"
              }`}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-md font-sans transition-all duration-150"
          >
            Submit Updates
          </button>
        </form>
      </div>
    </div>
  );
};

export default Updates;
