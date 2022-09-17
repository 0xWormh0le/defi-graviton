import {Avatar, Grid, Paper, Typography} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import GravatarModule from "gravatar";
import React, {useEffect, useState} from "react";
import MetaTags from "react-meta-tags";
import {useHistory, useParams} from "react-router-dom";
import {NOT_FOUND} from "../../constants/routes";
import NavBar from "../navigation_bar/NavBar";
import {IUserData} from "../storage_engine/models/FirebaseDataModels";
import {UserStorage} from "../storage_engine/UserStorage";
import LargeSpinner from "../utils/LargeSpinner";
import {setBodyClass} from "../utils/SetHtmlBodyClass";
import "./Profile.css";
import ProfileDocsParts from "./ProfileDocsParts";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        Profile: {
            height: "calc(100% - " + theme.spacing(8) + "px)",
            padding: theme.spacing(3),
            paddingBottom: 0,
            margin: "0 auto",
            maxWidth: theme.spacing(200),
            textAlign: "center",
        },
        fullnameHandleHeader: {
            fontSize: theme.spacing(3),
            fontWeight: "normal",
            textTransform: "capitalize",
            marginTop: "0",
            marginBottom: "0",
        },
        avatarDetailsContainer: {
            padding: theme.spacing(3),
        },
        avatarContainer: {
            padding: theme.spacing(5),
            paddingBottom: 0,
            paddingTop: 0,
        },
        avatarSizingContainer: {
            width: "100%",
            paddingBottom: "100%",
            position: "relative",
        },
        avatar: {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
        },
        detailsContainer: {
            paddingTop: theme.spacing(2),
            [theme.breakpoints.down("md")]: {
                textAlign: "initial",
                paddingTop: 0,
            },
            [theme.breakpoints.down("xs")]: {
                textAlign: "center",
                paddingTop: theme.spacing(2),
            },
        },
    }),
);

const Profile = () => {
    const classes = useStyles();
    const {userHandle} = useParams();
    const history = useHistory();
    const [profileUser, setSetProfileUser] = useState<IUserData | null>(null);
    const [errorState, setErrorState] = useState("");
    const [loading, setLoading] = useState(true);

    setBodyClass("ProfileBody")();

    useEffect(() => {
        fetchProfileUser();

        async function fetchProfileUser() {
            if (userHandle) {
                const userData = await new UserStorage().getUserByHandle(userHandle);
                if (userData) {
                    setSetProfileUser(userData);
                } else {
                    setErrorState("User not found");
                    history.push(NOT_FOUND);
                }

                setLoading(false);
            }
        }
    }, [userHandle, history]);

    function getProfileMetaTitle() {
        let title = profileUser?.handle;
        if (profileUser?.full_name) {
            title = title + " (" + profileUser.full_name + ")";
        }

        return title;
    }

    if (loading) {
        return <LargeSpinner content="Loading ..." />;
    }

    if (errorState) {
        return <div>Error Loading profile. Message {errorState}</div>;
    }

    if (!profileUser) {
        return null;
    }

    return (
        <div>
            <MetaTags>
                <title>{getProfileMetaTitle()}</title>
            </MetaTags>
            <NavBar/>
            <div className={classes.Profile}>
                <Grid container spacing={3}>
                    <Grid item sm={12} md={12} lg={3}>
                        <Paper square className={classes.avatarDetailsContainer}>
                            <Grid container>
                                <Grid item xs={12} sm={4} md={4} lg={12} className={classes.avatarContainer}>
                                    <div className={classes.avatarSizingContainer}>
                                        <Avatar
                                            alt={profileUser?.full_name}
                                            className={classes.avatar}
                                            src={profileUser?.picture || GravatarModule.url(
                                                profileUser?.email || "",
                                                {size: "400"})
                                            }
                                        />
                                    </div>
                                </Grid>
                                <Grid item xs={12} sm={8} md={8} lg={12} className={classes.detailsContainer}>
                                    <Typography component="h2" className={classes.fullnameHandleHeader}>
                                        {profileUser?.full_name ? profileUser?.full_name : profileUser?.handle}
                                    </Typography>
                                    <Typography variant="subtitle1">{profileUser?.email}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item sm={12} md={12} lg={9}>
                        <ProfileDocsParts profileUser={profileUser}/>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default Profile;
