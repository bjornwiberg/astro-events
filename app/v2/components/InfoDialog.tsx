import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { track } from "../../../utils/mixpanel";
import { useAppContext } from "./AppProvider";

type InfoDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function InfoDialog({ open, onClose }: InfoDialogProps) {
  const { t } = useAppContext();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            backgroundImage: "none",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          color: theme.palette.text.primary,
        }}
      >
        <Typography variant="h6" component="span" fontWeight={600}>
          {t("info.title")}
        </Typography>
        <IconButton onClick={() => { track("Close Info Dialog"); onClose(); }} size="small" aria-label="close" edge="end">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="text.secondary">
          {t("info.description")}
        </Typography>

        <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          {t("info.contact.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Björn Wiberg ·{" "}
          <Link
            href="https://bjrn.nu"
            target="_blank"
            rel="noopener"
            color="inherit"
            underline="hover"
            onClick={() => track("Click Info Dialog Link", { link: "bjrn.nu" })}
          >
            bjrn.nu
          </Link>
        </Typography>

        <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {t("info.support.title")}
          </Typography>
          <FavoriteIcon sx={{ fontSize: 13, color: "secondary.main" }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("info.support.description")}{" "}
          <Link
            href="https://revolut.me/bjornwiberg"
            target="_blank"
            rel="noopener"
            color="text.primary"
            underline="hover"
            fontWeight={600}
            onClick={() => track("Click Info Dialog Link", { link: "revolut" })}
          >
            @bjornwiberg
          </Link>{" "}
          {t("info.support.orSwish")}{" "}
          <Link
            href="tel:+46735112444"
            color="text.primary"
            underline="hover"
            fontWeight={600}
            onClick={() => track("Click Info Dialog Link", { link: "swish" })}
          >
            +46 73 511 24 44
          </Link>
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
            <Box
              component="img"
              src="/v2/revolut-qr.png"
              alt="Revolut QR code @bjornwiberg"
              sx={{
                width: 130,
                height: 130,
                display: "block",
                borderRadius: 1.5,
                filter: isDark ? "contrast(2)" : "invert(1) contrast(2)",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Revolut
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
            <Box
              component="img"
              src="/v2/swish-qr.png"
              alt="Swish QR code +46 73 511 24 44"
              sx={{
                width: 130,
                height: 130,
                display: "block",
                borderRadius: 1.5,
                filter: isDark ? "invert(1) contrast(2)" : "contrast(2)",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Swish
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
