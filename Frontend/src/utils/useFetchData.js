import { useState } from "react";
import axios from "axios";

const useFetchData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const SERVER_URI = import.meta.env.VITE_SERVER_URI;
  const fetchData = async (url, method, formData = null) => {
    try {
      setLoading(true);

      let response;

      if (method == "GET") {
        response = await axios.get(`${SERVER_URI}/${url}`, {
          withCredentials: true,
        });
      } else if (method == "POST") {
        response = await axios({
          method: "POST",
          url: `${SERVER_URI}/${url}`,
          data: formData,
          withCredentials: true,
        });
      } else if (method === "PUT") {
        response = await axios({
          method: "PUT",
          url: `${SERVER_URI}/${url}`,
          data: formData,
        });
      } else if (method === "DELETE") {
        response = await axios({
          method: "DELETE",
          url: `${SERVER_URI}/api/${url}`,
        });
      }

      // console.log(response.data, "response");
      setData(response.data);
    } catch (error) {
      console.log(error, "errrorrr");
      if (error.message === "Network Error") {
        return setError(error);
      }
      setError(error?.response || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
};

export default useFetchData;
