import { Card, CardContent, Typography, Box } from "@mui/material";

const KPIStatCard = ({
  title,
  value,
  icon,
  color = "#1976d2",
}) => {
  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 8,
        },
      }}
    >
      <CardContent>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            {title}
          </Typography>

          <Box
            sx={{
              bgcolor: color,
              color: "#fff",
              width: 44,
              height: 44,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography
          variant="h4"
          fontWeight="bold"
          mt={2}
        >
          {value}
        </Typography>

      </CardContent>
    </Card>
  );
};

export default KPIStatCard;