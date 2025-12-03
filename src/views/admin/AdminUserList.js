import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardBody,
  Table,
  Row,
  Col,
  FormGroup,
  CardHeader,
  Input,
  CardTitle,
  Button,
  Badge,
} from "reactstrap";

import * as ApiManager from "../../helpers/ApiManager.tsx";
import Loader from "components/common/Loader.js";
import moment from "moment";
import ChangeAccountPlan from "components/admin/ChangeAccountPlan.js";
import IssueCardModal from "components/admin/IssueCardModal.js";
import BlockCardModal from "components/admin/BlockCardModal.js";
import CloseAccountModal from "components/admin/CloseAccountModal.js";

function Beneficiary() {
  const [logData, setlogData] = useState([]);
  const [filteredData, setfilteredData] = useState([]);

  const [accountSelected, setaccountSelected] = useState(null);
  const [AccountData, setAccountData] = useState([]);

  const AccountPlanRef = useRef();
  const IssueCardRef = useRef();
  const BlockCardRef = useRef();
  const CloseAccountRef = useRef();

  // Fetch users on mount
  useEffect(() => {
    let isActive = true;

    const fetchUsers = async () => {
      const res = await ApiManager.AdminUserList(); // Make sure token is included inside this function
      if (isActive && res?.status === "success") {
        setlogData(res.data);
        setfilteredData(res.data);
      }
    };

    fetchUsers();

    return () => {
      isActive = false;
    };
  }, []);

  // Fetch selected user's cards
  useEffect(() => {
    let isActive = true;

    const fetchUserCards = async () => {
      if (!accountSelected) return;
      const res = await ApiManager.AdminUserCards({ userId: accountSelected._id });
      if (isActive && res?.status === "success") {
        setAccountData(res.data);
      }
    };

    fetchUserCards();

    return () => {
      isActive = false;
    };
  }, [accountSelected]);

  const handleSearch = (text, type) => {
    if (!logData) return;

    const lower = text.toLowerCase();
    if (lower === "") {
      setfilteredData(logData);
    } else {
      setfilteredData(
        logData.filter((x) => {
          return type === "cid"
            ? x._id === lower // use _id from API response
            : x[type].toString().toLowerCase().includes(lower);
        })
      );
    }
  };

  return (
    <div className="content">
      <Row>
        <Col>
          {accountSelected ? (
            !AccountData ? (
              <Loader />
            ) : (
              <>
                <ChangeAccountPlan
                  ModalRef={AccountPlanRef}
                  Reset={() => {
                    setAccountData(null);
                    setaccountSelected(null);
                    setlogData(null);
                  }}
                />
                <IssueCardModal
                  ModalRef={IssueCardRef}
                  Reset={() => setAccountData(null)}
                />
                <BlockCardModal
                  ModalRef={BlockCardRef}
                  Reset={() => setAccountData(null)}
                />
                {/* User Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle tag="h3">User Details</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col className="pr-md-1">
                        <FormGroup>
                          <label>User ID</label>
                          <Input value={accountSelected._id} disabled />
                        </FormGroup>
                      </Col>
                      <Col className="pr-md-1">
                        <FormGroup>
                          <label>Name</label>
                          <Input
                            value={`${accountSelected.fname} ${accountSelected.lname}`}
                            disabled
                          />
                        </FormGroup>
                      </Col>
                      <Col className="pr-md-1">
                        <FormGroup>
                          <label>Account No</label>
                          <Input value={accountSelected.account_no} disabled />
                        </FormGroup>
                      </Col>
                      <Col>
                        <FormGroup>
                          <label>Account Plan</label>
                          <Input value={accountSelected.type || "N/A"} disabled />
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
                {/* User Cards */}
                <Card>
                  <CardHeader>
                    <CardTitle tag="h3">User Cards</CardTitle>
                    <Button
                      color="black"
                      onClick={() => IssueCardRef.current(true, accountSelected._id)}
                    >
                      Issue new card
                    </Button>
                  </CardHeader>
                  <CardBody>
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Card Number</th>
                          <th>CVC</th>
                          <th>Expiration</th>
                          <th>Type</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {AccountData.map((card, i) => (
                          <tr key={i}>
                            <td>{card.cardnumber}</td>
                            <td>{card.cvc}</td>
                            <td>{moment(card.expiration).format("MM/YYYY")}</td>
                            <td>{card.type}</td>
                            <td>
                              <Button
                                color="danger"
                                onClick={() =>
                                  BlockCardRef.current(true, { cardid: card._id })
                                }
                              >
                                Block
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </>
            )
          ) : !logData ? (
            <Loader />
          ) : (
            <>
              <CloseAccountModal ModalRef={CloseAccountRef} Reset={() => setlogData(null)} />
              <Card>
                <CardHeader>
                  <CardTitle tag="h3">User List</CardTitle>
                  <FormGroup>
                    <Row>
                      <Col md={6}>
                        <Input
                          placeholder="Search by ID"
                          type="text"
                          onChange={(e) => handleSearch(e.target.value, "_id")}
                        />
                      </Col>
                      <Col md={6}>
                        <Input
                          placeholder="Search by Account No"
                          type="text"
                          onChange={(e) => handleSearch(e.target.value, "account_no")}
                        />
                      </Col>
                    </Row>
                  </FormGroup>
                </CardHeader>
                <CardBody>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Account No</th>
                        <th>Account Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((user) => (
                        <tr key={user._id}>
                          <td>{user._id}</td>
                          <td>{user.fname} {user.lname}</td>
                          <td>{user.account_no}</td>
                          <td>
                            <Badge color={!user.closed ? "primary" : "secondary"}>
                              {user.closed ? "Closed" : "Open"}
                            </Badge>
                          </td>
                          <td>
                            {!user.closed ? (
                              <>
                                <Button className="btn-success" onClick={() => setaccountSelected(user)}>
                                  Account Info
                                </Button>
                                <Button
                                  className="ml-2 btn-danger"
                                  onClick={() => CloseAccountRef.current(true, { userId: user._id })}
                                >
                                  Close Account
                                </Button>
                              </>
                            ) : (
                              <>No Actions</>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default Beneficiary;
