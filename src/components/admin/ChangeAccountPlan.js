import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Label,
  Form,
  Row,
  Col,
} from "reactstrap";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as ApiManager from "helpers/ApiManager.tsx";

function ChangeAccountPlan({ ModalRef, Reset }) {
  const [OpenModal, setOpenModal] = useState(false);
  const [APIWorking, setAPIWorking] = useState(false);
  const [cid, setcid] = useState(null);

  ModalRef.current = (e, id, type) => {
    setOpenModal(e);
    setcid(id);
    validation.setFieldValue("type", type);
  };

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      cid,
      type: "",
    },
    validationSchema: Yup.object({
      type: Yup.string().required("Please select account type"),
    }),
    onSubmit: async (values) => {
      try {
        if (APIWorking) return;

        setAPIWorking(true);
        const res = await ApiManager.AdminChangeAccountPlan(values);
        if (res) {
          toast.success(`Account Plan Updated`);
          Reset();
        }
        setAPIWorking(false);
      } catch (e) {
        setAPIWorking(false);
        toast.error(`${e.message}`);
      }
    },
  });

  return (
    <Modal
      isOpen={OpenModal}
      toggle={() => {
        if (!APIWorking) {
          setOpenModal(false);
        }
      }}
      id="infomodal"
      size="lg"
      style={{ maxWidth: "700px", width: "100%" }}
    >
      <ModalHeader className="d-flex flex-row">
        <h5 className="modal-title" id="exampleModalToggleLabel2">
          Change Account Plan
        </h5>
      </ModalHeader>
      <ModalBody className="p-5">
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
          action="#"
        >
          <div className="mb-3">
            <Row>
              <Col>
                <div className="form-check">
                  <Input
                    type="radio"
                    name="type"
                    id="Basic"
                    className="form-check-input"
                    value="Basic"
                    onChange={validation.handleChange}
                    checked={validation.values.type === "Basic"}
                  />
                  <Label className="form-check-label" htmlFor="Basic">
                    Basic
                  </Label>
                </div>
              </Col>
              <Col>
                <div className="form-check">
                  <Input
                    type="radio"
                    name="type"
                    id="Premium"
                    className="form-check-input"
                    value="Premium"
                    onChange={validation.handleChange}
                    checked={validation.values.type === "Premium"}
                  />
                  <Label className="form-check-label" htmlFor="Premium">
                    Premium
                  </Label>
                </div>
              </Col>
              <Col>
                <div
                  className="form-check"
                  style={{
                    marginLeft: "40px",
                  }}
                >
                  <Input
                    type="radio"
                    name="type"
                    id="World"
                    className="form-check-input"
                    value="World"
                    onChange={validation.handleChange}
                    checked={validation.values.type === "World"}
                  />
                  <Label className="form-check-label" htmlFor="World">
                    World
                  </Label>
                </div>
              </Col>
            </Row>
          </div>

          <div className="mt-4">
            <Button
              className={`btn btn-${APIWorking ? "success" : "danger"} w-100`}
              type="submit"
            >
              {APIWorking ? <>Working...</> : <>Update</>}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
}

export default ChangeAccountPlan;
