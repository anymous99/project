import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import Auth from '../utils/auth';
import { getCardioById, getResistanceById, updateCardio, updateResistance, deleteCardio, deleteResistance } from '../utils/API';
import { formatDate } from '../utils/dateFormat';
import Header from "./Header";
import cardioIcon from "../assets/images/cardio-w.png";
import resistanceIcon from "../assets/images/resistance-w.png";

export default function SingleExercise() {
  const { id, type } = useParams();
  const [cardioData, setCardioData] = useState({});
  const [resistanceData, setResistanceData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false); // State to track whether updating mode is active

  const updatedNameRef = useRef(null);
  const updatedDistanceRef = useRef(null);
  const updatedDurationRef = useRef(null);
  const updatedWeightRef = useRef(null);
  const updatedSetsRef = useRef(null);
  const updatedRepsRef = useRef(null);

  const loggedIn = Auth.loggedIn();
  const navigate = useNavigate();

  const displayExercise = useCallback(async (exerciseId) => {
    //get token
    const token = loggedIn ? Auth.getToken() : null;
    if (!token) return false;

    // fetch cardio data by id
    if (type === "cardio") {
      try {
        const response = await getCardioById(exerciseId, token);
        if (!response.ok) { throw new Error('something went wrong!'); }

        const cardio = await response.json();
        cardio.date = formatDate(cardio.date);
        setCardioData(cardio);
      } catch (err) { console.error(err); }
    }

    // fetch resistance data by id
    else if (type === "resistance") {
      try {
        const response = await getResistanceById(exerciseId, token);
        if (!response.ok) { throw new Error('something went wrong!'); }

        const resistance = await response.json();
        resistance.date = formatDate(resistance.date);
        setResistanceData(resistance);
      } catch (err) { console.error(err); }
    }
  }, [type, loggedIn]);

  useEffect(() => {
    displayExercise(id);
  }, [id, displayExercise]); // Make sure to close the array with "]"

  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  const handleDeleteExercise = async (exerciseId) => {
    const token = loggedIn ? Auth.getToken() : null;
    if (!token) return false;

    confirmAlert({
      title: "Delete Exercise",
      message: "Are you sure you want to delete this exercise?",
      buttons: [
        {
          label: "Cancel",
        },
        {
          label: "Delete",
          onClick: async () => {
            // delete cardio data
            if (type === "cardio") {
              try {
                const response = await deleteCardio(exerciseId, token);
                if (!response.ok) { throw new Error('something went wrong!'); }
              }
              catch (err) { console.error(err); }
            }

            // delete resistance data
            else if (type === "resistance") {
              try {
                const response = await deleteResistance(exerciseId, token);
                if (!response.ok) { throw new Error('something went wrong!'); }
              }
              catch (err) { console.error(err); }
            }

            // go back to history
            navigate("/history");
          }
        }
      ]
    });
  };

  const handleUpdateExercise = async () => {
    const token = loggedIn ? Auth.getToken() : null;
    if (!token) return false;

    try {
      // Update cardio data
      if (type === "cardio") {
        const updatedData = {
          name: updatedNameRef.current.value,
          distance: updatedDistanceRef.current.value,
          duration: updatedDurationRef.current.value,
        };

        const response = await updateCardio(id, updatedData, token);
        if (!response.ok) { throw new Error('something went wrong!'); }
      }

      // Update resistance data
      else if (type === "resistance") {
        const updatedData = {
          name: updatedNameRef.current.value,
          weight: updatedWeightRef.current.value,
          sets: updatedSetsRef.current.value,
          reps: updatedRepsRef.current.value,
        };

        const response = await updateResistance(id, updatedData, token);
        if (!response.ok) { throw new Error('something went wrong!'); }
      }

      // Fetch and display the updated exercise data
      displayExercise(id);

      // Disable the updating mode after successful update
      setIsUpdating(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={type === "cardio" ? "single-cardio" : "single-resistance"}>
      <Header />
      <h2 className='title text-center'>History</h2>
      <div className="single-exercise d-flex flex-column align-items-center text-center">
        {type === "cardio" && (
          <div className='cardio-div '>
            <div className='d-flex justify-content-center'><img alt="cardio" src={cardioIcon} className="exercise-form-icon" /></div>
            <p><span>Date: </span> {cardioData.date}</p>
            {!isUpdating && <p><span>Name: </span> {cardioData.name}</p>}
            {!isUpdating && <p><span>Distance: </span> {cardioData.distance} miles</p>}
            {!isUpdating && <p><span>Duration: </span> {cardioData.duration} minutes</p>}

            {isUpdating && (
              <>
              <form className='single-exercise d-flex flex-column'>
                <label >Name: </label>
                <input className='input'  type="text" id="updatedName" min={0} ref={updatedNameRef} defaultValue={cardioData.name} />
                <label>Distance: </label>
                <input className='input' type="text" id="updatedDistance" min={0} ref={updatedDistanceRef} defaultValue={cardioData.distance} />
                <label>Duration: </label>
                <input className='input' type="text" id="updatedDuration" min={0} ref={updatedDurationRef} defaultValue={cardioData.duration} />
                </form>
              </>
            )}

            {isUpdating && (
              <button className="update-btn" onClick={handleUpdateExercise}>
                Save Changes
              </button>
            )}

            <button className='delete-btn' onClick={() => handleDeleteExercise(id)}>Delete Exercise</button>
            {!isUpdating && (
              <button className="update-btn" onClick={() => setIsUpdating(true)}>
                Update Exercise
              </button>
            )}
          </div>
        )}
        {type === "resistance" && (
          <div className='resistance-div'>
            <div className='d-flex justify-content-center'><img alt="resistance" src={resistanceIcon} className="exercise-form-icon" /></div>
            <p><span>Date: </span> {resistanceData.date}</p>
            {!isUpdating && <p><span>Name: </span> {resistanceData.name}</p>}
            {!isUpdating && <p><span>Weight: </span> {resistanceData.weight} lbs</p>}
            {!isUpdating && <p><span>Sets: </span> {resistanceData.sets}</p>}
            {!isUpdating && <p><span>Reps: </span> {resistanceData.reps}</p>}

            {isUpdating && (
              <>
                <form className='single-exercise d-flex flex-column'>
                    <label>Name:</label>
                    <input className='input' type="text" id="updatedName" min={0} ref={updatedNameRef} defaultValue={resistanceData.name} />
                    <label>Weight: </label>
                    <input className='input' type="text" id="updatedWeight" min={0} ref={updatedWeightRef} defaultValue={resistanceData.weight} />
                    <label>Sets: </label>
                    <input className='input' type="text" id="updatedSets" min={0} ref={updatedSetsRef} defaultValue={resistanceData.sets} />
                    <label>Reps: </label>
                    <input className='input' type="text" id="updatedReps" min={0} ref={updatedRepsRef} defaultValue={resistanceData.reps} />
                </form>
              </>
            )}

            {isUpdating && (
              <button className="update-btn" onClick={handleUpdateExercise}>
                Save Changes
              </button>
            )}

            <button className='delete-btn' onClick={() => handleDeleteExercise(id)}>Delete Exercise</button>
            {!isUpdating && (
              <button className="update-btn" onClick={() => setIsUpdating(true)}>
                Update Exercise
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
