import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { validator } from "../../../utils/validator";
import TextField from "../../common/form/textField";
import SelectField from "../../common/form/selectField";
import RadioField from "../../common/form/radio.Field";
import MultiSelectField from "../../common/form/multiSelectField";
import BackHistoryButton from "../../common/backButton";
import { useProfession } from "../../../hooks/useProfession";
import { useQualities } from "../../../hooks/useQualities";
import { useAuth } from "../../../hooks/useAuth";
const EditUserPage = () => {
    const history = useHistory();
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState({
        email: "",
        password: "",
        profession: "",
        sex: "male",
        qualities: []
    });
    const { professions } = useProfession();
    const professionList = professions.map((p) => ({
        label: p.name,
        value: p._id
    }));
    const { qualities, isLoading: qualityLoading } = useQualities();
    const qualitiesList = qualities.map((q) => ({
        label: q.name,
        value: q._id
    }));
    const { currentUser, updateUser } = useAuth();
    const [errors, setErrors] = useState({});

    const getQualitiesById = (elements) => {
        if (qualitiesList.length !== 0) {
            const qualitiesQrray = [];
            for (let i = 0; i < elements.length; i++) {
                for (const qual of qualitiesList) {
                    if (qual.value === elements[i]) {
                        qualitiesQrray.push(qual);
                    }
                }
            }
            return qualitiesQrray;
        }
    };

    const user = {
        ...currentUser,
        qualities: getQualitiesById(currentUser.qualities)
    };
    useEffect(() => {
        setData(user);
        setLoading(false);
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validate();
        if (!isValid) return;
        const { qualities } = data;
        try {
            await updateUser({
                ...data,
                qualities: qualities.map((q) => q.value)
            });
            history.push(`/users/${data._id}`);
        } catch (error) {
            setErrors(error);
        }
    };

    // useEffect(() => {
    //     setLoading(true);
    //         setData((prevState) => ({
    //             ...prevState,
    //             ...data,
    //             profession: profession._id
    //         })
    //     );
    // }, []);
    // useEffect(() => {
    //     if (qualitiesList.length > 0) setIsLoading(false);
    // }, [data]);

    const validatorConfig = {
        email: {
            isRequired: {
                message: "Электронная почта обязательна для заполнения"
            },
            isEmail: {
                message: "Email введен некорректно"
            }
        },

        name: {
            isRequired: {
                message: "Введите ваше имя"
            }
        }
    };
    useEffect(() => validate(), [data]);
    const handleChange = (target) => {
        setData((prevState) => ({
            ...prevState,
            [target.name]: target.value
        }));
    };
    const validate = () => {
        const errors = validator(data, validatorConfig);
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const isValid = Object.keys(errors).length === 0;
    return (
        <div className="container mt-5">
            <BackHistoryButton />
            <div className="row">
                <div className="col-md-6 offset-md-3 shadow p-4">
                    {!qualityLoading &&
                    !isLoading &&
                    Object.keys(professions).length > 0 ? (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Имя"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                                error={errors.name}
                            />
                            <TextField
                                label="Электронная почта"
                                name="email"
                                value={data.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                            <SelectField
                                label="Выбери свою профессию"
                                defaultOption="Choose..."
                                name="profession"
                                options={professionList}
                                onChange={handleChange}
                                value={data.profession}
                                error={errors.profession}
                            />
                            <RadioField
                                options={[
                                    { name: "Male", value: "male" },
                                    { name: "Female", value: "female" },
                                    { name: "Other", value: "other" }
                                ]}
                                value={data.sex}
                                name="sex"
                                onChange={handleChange}
                                label="Выберите ваш пол"
                            />
                            <MultiSelectField
                                defaultValue={data.qualities || []}
                                options={qualitiesList}
                                onChange={handleChange}
                                name="qualities"
                                label="Выберите ваши качества"
                            />
                            <button
                                type="submit"
                                disabled={!isValid}
                                className="btn btn-primary w-100 mx-auto"
                            >
                                Обновить
                            </button>
                        </form>
                    ) : (
                        "Loading..."
                    )}
                </div>
            </div>
        </div>
    );
};
export default EditUserPage;
