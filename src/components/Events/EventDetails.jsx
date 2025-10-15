import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent, deleteEvent, queryClient } from "../../util/http.js";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import Header from "../Header.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: errorDeletion,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });
  let content;
  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <LoadingIndicator />
      </div>
    );
  }
  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="failed to load an event"
          message={error.info?.message || "oops try again later"}
        />
      </div>
    );
  }
  let formatter;
  if (data) {
    formatter = new Date(data.date).toLocaleDateString("en-Us", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  function handelStartDelete() {
    setIsDeleting(true);
  }
  function handelStopDeleting() {
    setIsDeleting(false);
  }

  function handelDeleteEvent() {
    mutate({ id: params.id });
  }
  return (
    <>
      {isDeleting && (
        <Modal onClose={handelStopDeleting}>
          <h2>Are you sure?</h2>
          <p>Do you want to delete event? action cannont be undone</p>
          <div className="form-actions">
            {isPendingDeletion && <h3>Deleting please wait.....</h3>}
            {!isPendingDeletion && (
              <>
                <button onClick={handelStopDeleting} className="button-text">
                  cancel
                </button>
                <button onClick={handelDeleteEvent} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeletion && (
            <ErrorBlock
              title="oops failed to delete an event"
              message={errorDeletion.info?.message || "oops try again later"}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {content && content}
      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={handelStartDelete}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {formatter} @ {data.time}
                </time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
