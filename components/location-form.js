"use client"

import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

export default function LocationForm({ onSubmit }) {
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ location, address });
    }
    setLocation("");
    setAddress("");
  };

  return (
    <div style={{ height: '100%', width: '35%', margin: '0 auto', border: '2.5px solid navy', padding: 30 }}>
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%"}}
    >
      <Typography variant="h5" textAlign="center">
        Missing Somewhere?
      </Typography>
      <Typography variant="h7" textAlign="center">
        Submit a new location below to be added to our discount database
      </Typography>


      <TextField
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />

      <TextField
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        multiline
        rows={3}
        required
      />

      <Button type="submit" variant="contained" style={{ backgroundColor: 'navy', color: 'white' }}>
        Submit
      </Button>
    </Box>
    </div>
  );
}