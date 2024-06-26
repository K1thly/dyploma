import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faBookOpen, faFileAlt, faClipboardList, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { CSSTransition } from 'react-transition-group';
import TestSelectorModal from './TestSelectorModal';
import './CoursePage.css';

const CoursePage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false);
    const navigate = useNavigate();
    const [completedLessons, setCompletedLessons] = useState([]);
    const [takenTests, setTakenTests] = useState([]);
    const [availableTests, setAvailableTests] = useState([]);
    const [isTestSelectorOpen, setIsTestSelectorOpen] = useState(false);
    const [userId, setUserId] = useState('');

    const [isLessonsOpen, setIsLessonsOpen] = useState(true);
    const [isTestsOpen, setIsTestsOpen] = useState(true);
    const [isFilesOpen, setIsFilesOpen] = useState(true);

    const lessonsRef = useRef(null);
    const testsRef = useRef(null);
    const filesRef = useRef(null);

    useEffect(() => {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            setUserId(userData._id);
        }
    }, []);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/courses/${courseId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch course data');
                }
                const data = await response.json();
                setCourse(data.course);
                setIsAuthor(userId === data.course.authorId);

                const lessonPromises = data.course.lessonIds
                    .filter((lessonId) => lessonId !== null && lessonId !== undefined)
                    .map(async (lessonId) => {
                        const lessonResponse = await fetch(`http://localhost:3000/lessons/${lessonId}`);
                        const lessonData = await lessonResponse.json();
                        return lessonData.lesson;
                    });
                const lessons = await Promise.all(lessonPromises);

                const testPromises = data.course.testIds
                    .filter((testId) => testId !== null && testId !== undefined)
                    .map(async (testId) => {
                        const testResponse = await fetch(`http://localhost:3000/tests/${testId}`);
                        const testData = await testResponse.json();
                        return testData.test;
                    });
                const tests = await Promise.all(testPromises);

                setCourse((prevCourse) => ({ ...prevCourse, lessons, tests }));

                const availableTestsResponse = await fetch(`http://localhost:3000/tests?authorId=${userId}`);
                if (!availableTestsResponse.ok) {
                    throw new Error('Failed to fetch available tests');
                }
                const availableTestsData = await availableTestsResponse.json();
                setAvailableTests(availableTestsData.tests);

                setLoading(false);

                if (userId) {
                    const userResponse = await fetch(`http://localhost:3000/users/${userId}/info`);
                    const datauser = await userResponse.json();
                    const completedLessons = datauser.user.enrolledCourses.reduce((acc, course) => {
                        if (course.courseId._id === courseId) {
                            return acc.concat(course.completedLessons.map(lesson => lesson._id));
                        }
                        return acc;
                    }, []);
                    setCompletedLessons(completedLessons);
                }
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, userId]);

    useEffect(() => {
        if (userId) {
            fetch(`http://localhost:3000/users/${userId}/info`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.user) {
                        setTakenTests(Array.isArray(data.user.testsTaken) ? data.user.testsTaken : []);
                    }
                })
                .catch(error => console.error('Error fetching user info:', error));
        }
    }, [userId]);

    const isLessonCompleted = (lessonId) => {
        return completedLessons.includes(lessonId);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const handleAddLesson = () => {
        navigate(`/course/${courseId}/createlesson`);
    };

    const handleEditLesson = (lesson) => {
        navigate(`/course/${courseId}/lesson/${lesson._id}/edit`);
    };

    const handleEditTest = (test) => {
        navigate(`/test/${test._id}/edit`);
    };

    const handleOpenTestSelector = () => {
        setIsTestSelectorOpen(true);
    };

    const handleCloseTestSelector = () => {
        setIsTestSelectorOpen(false);
    };

    const handleSelectTest = async (testId) => {
        try {
            const response = await fetch(`http://localhost:3000/${courseId}/tests`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ testId }),
            });

            if (!response.ok) {
                throw new Error('Failed to add test to course');
            }

            const updatedCourse = await response.json();
            console.log('Updated Course Tests:', updatedCourse);
            setCourse((prevCourse) => ({ ...prevCourse, tests: updatedCourse.course.tests }));
            setIsTestSelectorOpen(false);
            window.location.reload();
        } catch (error) {
            console.error('Error adding test to course:', error);
        }
    };

    return (
        <div className="bg-gray-900 text-gray-300 min-h-screen p-8">
            {course && (
                <>
                    <div className="text-center mb-8">
                        <div className="inline-block bg-gray-800 p-4 rounded-full mb-4">
                            <FontAwesomeIcon icon={faBookOpen} size="3x" className="text-teal-600" />
                        </div>
                        <h1 className="text-4xl font-bold">{course.courseName}</h1>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <h3
                                className="text-2xl font-bold mb-4 cursor-pointer flex justify-center gap-2"
                                onClick={() => setIsLessonsOpen(!isLessonsOpen)}
                            >
                                Lessons
                                {isAuthor && (
                                    <button onClick={handleAddLesson} className="text-gray-300 hover:text-gray-400">
                                        <FontAwesomeIcon icon={faPlus} size="lg" />
                                    </button>
                                )}
                            </h3>
                            {course.lessons && (
                                <CSSTransition
                                    in={isLessonsOpen}
                                    timeout={300}
                                    classNames="section"
                                    unmountOnExit
                                    nodeRef={lessonsRef}
                                >
                                    <div className="bg-gray-800 p-4 rounded-lg" ref={lessonsRef}>
                                        {course.lessons.map((lesson, index) => (
                                            <div key={index} className="flex justify-between items-center mb-2">
                                                <Link to={`/course/${courseId}/lesson/${lesson._id}`} className="flex-grow text-left">
                                                    <button className="w-full text-left text-lg bg-transparent p-4 m-0 border-none text-gray-300 hover:bg-gray-700 hover:rounded-lg">
                                                        <FontAwesomeIcon
                                                            icon={faBookOpen}
                                                            size="lg"
                                                            className="text-gray-600"
                                                        />{' '}
                                                        {lesson.lessonName}
                                                    </button>
                                                </Link>
                                                {isAuthor && (
                                                    <button onClick={() => handleEditLesson(lesson)} className="text-gray-300 hover:text-gray-400">
                                                        <FontAwesomeIcon icon={faEdit} size="lg" />
                                                    </button>
                                                )}
                                                <FontAwesomeIcon
                                                    icon={faCheckCircle}
                                                    className={`ml-2 ${isLessonCompleted(lesson._id) ? 'text-teal-600' : 'text-gray-500'}`}
                                                    size="2x"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CSSTransition>
                            )}
                        </div>
                        <div className="mb-6">
                            <h3
                                className="text-2xl font-bold mb-4 cursor-pointer flex justify-center gap-2"
                                onClick={() => setIsTestsOpen(!isTestsOpen)}
                            >
                                Tests
                                {isAuthor && (
                                    <button onClick={handleOpenTestSelector} className="text-gray-300 hover:text-gray-400">
                                        <FontAwesomeIcon icon={faPlus} size="lg" />
                                    </button>
                                )}
                            </h3>
                            {course.tests && (
                                <CSSTransition
                                    in={isTestsOpen}
                                    timeout={300}
                                    classNames="section"
                                    unmountOnExit
                                    nodeRef={testsRef}
                                >
                                    <div className="bg-gray-800 p-4 rounded-lg" ref={testsRef}>
                                        {course.tests.map((test, index) => {
                                            const isTestCompleted = takenTests.some(takenTest => takenTest.testId._id === test._id);
                                            const grade = isTestCompleted ? takenTests.find(takenTest => takenTest.testId._id === test._id).grade : null;

                                            return (
                                                <div key={index} className="flex justify-between items-center mb-2">
                                                    <Link to={`/test/${test._id}`} className="flex-grow text-left">
                                                        <button className="w-full text-left text-lg bg-transparent p-4 m-0 border-none text-gray-300 hover:bg-gray-700 hover:rounded-lg">
                                                            <FontAwesomeIcon
                                                                icon={faClipboardList}
                                                                size="lg"
                                                                className="text-gray-600"
                                                            />{' '}
                                                            {test.testName}
                                                        </button>
                                                    </Link>
                                                    {isAuthor && (
                                                        <button onClick={() => handleEditTest(test)} className="text-gray-300 hover:text-gray-400">
                                                            <FontAwesomeIcon icon={faEdit} size="lg" />
                                                        </button>
                                                    )}
                                                    {isTestCompleted ? (
                                                        <span className="ml-2 text-teal-600 text-xl">{grade}</span>
                                                    ) : (
                                                        <FontAwesomeIcon
                                                            icon={faCheckCircle}
                                                            className='ml-2 text-gray-500'
                                                            size="2x"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CSSTransition>
                            )}
                        </div>
                        <div className="mb-6">
                            <h3
                                className="text-2xl font-bold mb-4 cursor-pointer flex justify-center gap-2"
                                onClick={() => setIsFilesOpen(!isFilesOpen)}
                            >
                                Files
                            </h3>
                            {course.files && (
                                <CSSTransition
                                    in={isFilesOpen}
                                    timeout={300}
                                    classNames="section"
                                    unmountOnExit
                                    nodeRef={filesRef}
                                >
                                    <div className="bg-gray-800 p-4 rounded-lg" ref={filesRef}>
                                        {course.files.map((file, index) => (
                                            <div key={index} className="flex justify-between items-center mb-2">
                                                <a
                                                    href={file.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-grow text-left text-lg bg-transparent p-4 m-0 border-none text-gray-300 hover:bg-gray-700 hover:rounded-lg"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faFileAlt}
                                                        size="lg"
                                                        className="text-gray-600"
                                                    />{' '}
                                                    {file.fileName}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </CSSTransition>
                            )}
                        </div>
                    </div>
                </>
            )}
            {isTestSelectorOpen && (
                <TestSelectorModal
                    availableTests={availableTests}
                    onClose={handleCloseTestSelector}
                    onSelectTest={handleSelectTest}
                />
            )}
        </div>
    );
};

export default CoursePage;
