import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "./useAuth";
import { nanoid } from "nanoid";
import { useParams } from "react-router-dom";
import commentService from "../services/comment.service";
import { toast } from "react-toastify";

const CommentsContext = React.createContext();

export const useComments = () => {
    return useContext(CommentsContext);
};

export const CommentsProvider = ({ children }) => {
    const { userId } = useParams();
    const [comments, setComments] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    
    useEffect(() => {
        getCommentsData();
    }, [userId]);
    useEffect(() => {
        if (error !== null) {
            toast.error(error);
            setError(null);
        }
    }, [error]);
    async function createComment(data) {
        const comment = {
            ...data,
            _id: nanoid(),
            pageId: userId,
            userId: currentUser._id,
            created_at: Date.now()
        };
        try {
            const { content } = await commentService.createComment(comment);
            setComments((prevState) => [...prevState, content]);
            setLoading(false);
        } catch (error) {
            catcherErrors(error);
        }
    }
    async function getCommentsData() {
        try {
            const { content } = await commentService.getComments(userId);
            setComments(content);
        } catch (error) {
            catcherErrors(error);
        } finally {
            setLoading(false);
        }
    }
    async function deleteComment(commentId) {
        try {
            await commentService.deleteComments(commentId);
            setComments((prevState) =>
                prevState.filter((c) => c._id !== commentId)
            );
        } catch (error) {
            catcherErrors(error);
        }
    }
    function catcherErrors(error) {
        const { message } = error.response.data;
        setError(message);
        setLoading(false);
    }
    return (
        <CommentsContext.Provider
            value={{ isLoading, comments, createComment, deleteComment }}
        >
            {children}
        </CommentsContext.Provider>
    );
};

CommentsProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ])
};
