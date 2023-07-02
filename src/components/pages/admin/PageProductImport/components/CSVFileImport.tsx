import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios, { AxiosError, AxiosRequestHeaders } from "axios";
import { Toaster, toast } from "react-hot-toast";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | null>(null);

  // React.useEffect(() => {
  //   localStorage.setItem("authorization_token", "cHktY3M6VEVTVF9QQVNTV09SRA==");
  // }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);
    if (!file) return;

    // Get the presigned URL
    const token = localStorage.getItem("authorization_token");
    const headers: AxiosRequestHeaders = {};
    if (token) {
      headers.Authorization = "Basic " + token;
    }
    try {
      const response = await axios({
        method: "GET",
        url: `${url}?name=${file.name}`,
        headers,
      });
      console.log("resp: ", response);
      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", response.data);

      const result = await fetch(response.data, {
        method: "PUT",
        body: file,
      });
      console.log("Result: ", result);
      setFile(null);
      toast.success("File uploaded successfully");
    } catch (error: unknown | AxiosError<{ message: string }>) {
      if (error instanceof AxiosError) {
        const message = error.response?.data.message || "Unexpected error";
        const code = error.response?.status.toString();
        const toastMessage = `(${code}) ${message}`;
        toast.error(toastMessage);
      } else {
        toast.error("Unexpected error");
      }
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {!file ? (
          <input type="file" onChange={onFileChange} />
        ) : (
          <div>
            <button onClick={removeFile}>Remove file</button>
            <button onClick={uploadFile}>Upload file</button>
          </div>
        )}
      </Box>
    </>
  );
}
