import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 8,
  borderRadius: 4,
  p: 4,
};

export default function ModalComponent(props) {
  return (
    <div>
      <Modal
        open={props.open}
        onClose={props.onClose}
        aria-labelledby="modal-modal-title"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            className="modal_title_style"
            variant="h6"
            component="h2"
            align="center"
          >
            {props.modalTitle}
          </Typography>
          {props.children}
        </Box>
      </Modal>
    </div>
  );
}
