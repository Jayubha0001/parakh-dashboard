import { TextField, MenuItem } from "@mui/material";

// One consistent dropdown look, reused everywhere a filter/select is
// needed (PGI Category, PARAKH Stage & Subject, National Benchmark
// View, PM Shri District, etc.) — a rounded white "pill" trigger with
// a soft border/shadow, and an open list whose rows have generous
// padding and a clear hover/selected state, instead of the cramped
// default MUI menu look.
const DropdownFilter = ({ value, onChange, options, minWidth = 300, sx = {}, ...rest }) => (
  <TextField
    select
    size="small"
    value={value}
    onChange={onChange}
    sx={{
      minWidth,
      "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        backgroundColor: "#fff",
        fontWeight: 600,
        fontSize: 14,
        color: "#16233B",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#E4E7F0",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0F172A",
      },
      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0F172A !important",
        borderWidth: "1.5px",
      },
      ...sx,
    }}
    SelectProps={{
      MenuProps: {
        PaperProps: {
          sx: {
            mt: 0.75,
            borderRadius: "14px",
            border: "1px solid #E4E7F0",
            boxShadow: "0 12px 32px rgba(15,23,42,0.14)",
            "& .MuiMenuItem-root": {
              px: 2.5,
              py: 1.4,
              fontSize: 14,
              fontWeight: 600,
              color: "#16233B",
              borderBottom: "1px solid #F0F1F5",
              "&:last-of-type": { borderBottom: "none" },
              "&:hover": { backgroundColor: "#F5F6FA" },
              "&.Mui-selected": { backgroundColor: "#EEF1FB" },
              "&.Mui-selected:hover": { backgroundColor: "#E4E9FA" },
            },
          },
        },
      },
    }}
    {...rest}
  >
    {options.map((o) => (
      <MenuItem key={o.value} value={o.value}>
        {o.label}
      </MenuItem>
    ))}
  </TextField>
);

export default DropdownFilter;
