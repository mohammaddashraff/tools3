--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1 (Debian 16.1-1.pgdg120+1)
-- Dumped by pg_dump version 16.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: DoctorsSchedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DoctorsSchedule" (
    scheduleid integer NOT NULL,
    slotedate date NOT NULL,
    starttime time without time zone NOT NULL,
    endtime time without time zone NOT NULL,
    doctorid integer NOT NULL,
    slotavail boolean DEFAULT true
);


ALTER TABLE public."DoctorsSchedule" OWNER TO postgres;

--
-- Name: DoctorsShedule_scheduleid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."DoctorsShedule_scheduleid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DoctorsShedule_scheduleid_seq" OWNER TO postgres;

--
-- Name: DoctorsShedule_scheduleid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."DoctorsShedule_scheduleid_seq" OWNED BY public."DoctorsSchedule".scheduleid;


--
-- Name: patientAppointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."patientAppointment" (
    appointmentid integer NOT NULL,
    patientid integer,
    doctorid integer,
    scheduleid integer,
    appointmentdate date,
    starttime time without time zone
);


ALTER TABLE public."patientAppointment" OWNER TO postgres;

--
-- Name: patientAppointment_appointmentid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."patientAppointment_appointmentid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."patientAppointment_appointmentid_seq" OWNER TO postgres;

--
-- Name: patientAppointment_appointmentid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."patientAppointment_appointmentid_seq" OWNED BY public."patientAppointment".appointmentid;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    userid integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    usertype character varying(255) NOT NULL,
    username character varying(255) NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_userid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_userid_seq OWNER TO postgres;

--
-- Name: user_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_userid_seq OWNED BY public."user".userid;


--
-- Name: DoctorsSchedule scheduleid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorsSchedule" ALTER COLUMN scheduleid SET DEFAULT nextval('public."DoctorsShedule_scheduleid_seq"'::regclass);


--
-- Name: patientAppointment appointmentid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."patientAppointment" ALTER COLUMN appointmentid SET DEFAULT nextval('public."patientAppointment_appointmentid_seq"'::regclass);


--
-- Name: user userid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN userid SET DEFAULT nextval('public.user_userid_seq'::regclass);


--
-- Data for Name: DoctorsSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DoctorsSchedule" (scheduleid, slotedate, starttime, endtime, doctorid, slotavail) FROM stdin;
4	2023-12-12	18:18:00	12:12:00	2	t
1	2023-11-16	12:30:00	19:30:00	2	t
3	2023-12-12	12:30:00	18:30:00	2	t
2	2023-10-27	21:30:00	18:30:00	2	t
\.


--
-- Data for Name: patientAppointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."patientAppointment" (appointmentid, patientid, doctorid, scheduleid, appointmentdate, starttime) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (userid, email, password, usertype, username) FROM stdin;
1	m@m	123	patient	m
2	k@k	123	doctor	k
\.


--
-- Name: DoctorsShedule_scheduleid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."DoctorsShedule_scheduleid_seq"', 4, true);


--
-- Name: patientAppointment_appointmentid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."patientAppointment_appointmentid_seq"', 3, true);


--
-- Name: user_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_userid_seq', 2, true);


--
-- Name: DoctorsSchedule DoctorsShedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorsSchedule"
    ADD CONSTRAINT "DoctorsShedule_pkey" PRIMARY KEY (scheduleid);


--
-- Name: patientAppointment patientAppointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."patientAppointment"
    ADD CONSTRAINT "patientAppointment_pkey" PRIMARY KEY (appointmentid);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (userid);


--
-- Name: DoctorsSchedule DoctorsShedule_doctorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorsSchedule"
    ADD CONSTRAINT "DoctorsShedule_doctorid_fkey" FOREIGN KEY (doctorid) REFERENCES public."user"(userid);


--
-- Name: patientAppointment patientAppointment_patientid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."patientAppointment"
    ADD CONSTRAINT "patientAppointment_patientid_fkey" FOREIGN KEY (patientid) REFERENCES public."user"(userid);


--
-- Name: patientAppointment patientAppointment_scheduleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."patientAppointment"
    ADD CONSTRAINT "patientAppointment_scheduleid_fkey" FOREIGN KEY (scheduleid) REFERENCES public."DoctorsSchedule"(scheduleid);


--
-- PostgreSQL database dump complete
--

