import { Box, CircularProgress, Typography } from "@mui/material";

const Loading = ({ message = "Loading data from Excel..." }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 2,
      }}
    >
      <CircularProgress size={48} sx={{ color: "#6A1B9A" }} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
};

export default Loading;
