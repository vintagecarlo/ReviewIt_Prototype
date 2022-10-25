import React from "react";
import "../css/Draft.css";
import Profile from "./Profile";
import { BearerTokenAuthProvider, createApiClient, TeamsFx} from "@microsoft/teamsfx";
import { createMicrosoftGraphClient } from "@microsoft/teamsfx";
import { app } from '@microsoft/teams-js';
import { Button, CardFooter, CardHeader, CardBody, Card, Datepicker, Dropdown, Flex, Dialog, RadioGroup, Text, TextArea } from "@fluentui/react-northstar";

export class Draft extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            address  : null,
            comment  : "",
            date     : null,
            priority : "normal",
            bypass : false
        }
        
        this.handleChange =  this.handleChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleCheckedValueChange = this.handleCheckedValueChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        await this.initTeamsFx();
        //await this.initGraphApi();
    }

    async initTeamsFx() {
        const teamsfx = new TeamsFx();
        // Get the user info from access token
        const userInfo = await teamsfx.getUserInfo();
        this.userInfo = userInfo   

        this.teamsfx = teamsfx;
        this.scope = ["User.Read.All"];
        this.channelOrChatId = await this.getChannelOrChatId();

        const credential = teamsfx.getCredential();
        const apiBaseUrl = teamsfx.getConfig("apiEndpoint") + "/api/";
        // createApiClient(...) creates an Axios instance which uses BearerTokenAuthProvider to inject token to request header
        const apiClient = createApiClient(
          apiBaseUrl,
          new BearerTokenAuthProvider(async () => (await credential.getToken("")).token));
        this.apiClient = apiClient;
    }

    async initGraphApi() {
      if (!await this.checkIsConsentNeeded()) {
        const graphClient = await createMicrosoftGraphClient(this.teamsfx, this.scope);
        //const memberList = await graphClient
          //.api("/teams/2ab9c796-2902-45f8-b712-7c5a63cf41c4/channels/19:20bc1df46b1148e9b22539b83bc66809@thread.skype/members")
          //.get();
        const memberList = (await graphClient.api(`/users/${this.userInfo.objectId}`).get()).displayName;
        this.memberList = memberList;
      }
    }

    async checkIsConsentNeeded() {
      try {
        await this.teamsfx.getCredential().getToken(this.scope);
      } catch (error) {
        this.setState({
          bypass: true
        });
        return true;
      }
      this.setState({
        bypass: false
      });
      return false;
    }

    async getChannelOrChatId() {
      return new Promise((resolve) => {
        app.getContext().then((context) => {
          if (context.channelId) {
            resolve(context.channelId);
          } else if (context.chatId) {
            resolve(context.chatId);
          } else {
            resolve(this.userInfo.objectId);
          }
        });
      });
    }
 
    async loginBtnClick(){
      try {
        await this.teamsfx.login(this.scope);
      } catch (err) {
        alert("Login failed: " + err);
        return;
      }
      await this.initGraphApi()
    }

    handleChange(event, option){
      //for address dropdown
      if(!event && option){
        this.setState({address : option.value});
        return;
      } 
      
      //for textarea
      this.setState({comment : option.value}); 
      event.preventDefault();
    }

    //for datepicker
    handleDateChange(event, option){
        this.setState({
            date : (option.value) ? 
            this.dateFormatter(option.value) : 
            this.dateFormatter(new Date())
        })
        event.preventDefault();
    }

    //for Radiogroup
    handleCheckedValueChange(event, option){
        this.setState({priority : option.value});
        event.preventDefault();
    }

    async handleSubmit(event) {
       var name = JSON.parse((JSON.stringify(this.state.address)));
       var data = {
         address : name[0].header,
         duedate : this.state.date,
         comment : this.state.comment,
         prio    : this.state.priority
       };

       var apiCall = null;

       if(this.isValidData(data)){
         //apiCall = await this.callFunctionWithErrorHandling("draftApi", "post", data);
         if(true) this.clearComponentState();
       } else {
            //TODO: to add proper error handling and UI display
            alert('All fields are required!\naddresses: ' + ((!this.state.address) ? "?" : this.state.address ) 
            + '\ncomment: ' + ((!this.state.comment) ? "?" : this.state.comment)
            + '\ndate: ' + ((!this.state.date) ? "?" : this.state.date)
            + '\nimportance: ' + this.state.priority);
       }
       event.preventDefault();
    }
    
    //TODO: To create common utility file for data validity checking
    isValidData(data){
        return ((JSON.stringify(data.address) !== "" && data.comment !== "" && data.duedate !== "") &&
        (JSON.stringify(data.address) !== null && data.comment !== null && data.duedate !== null) &&
        (JSON.stringify(data.address) !== undefined && data.comment !== undefined && data.duedate !== undefined)) 
    }
    
    //TODO: To be added in common utility file for date formatting
    dateFormatter =(date)=>{
       return new Intl.DateTimeFormat('en-US', 
       {year: 'numeric', month: '2-digit',day: '2-digit'})
       .format(date)
    }

    //TODO: To be added in common utility file for performing api call
    async callFunctionWithErrorHandling(command, method, options, params) {
        var message = [];
        var funcErrorMsg = "";
        try {
          const response = await this.apiClient.request({
            method: method,
            url: command,
            data: options,
            params
          });
          message = response.data;
        } catch (err) {
          if (err.response && err.response.status && err.response.status === 404) {
            funcErrorMsg =
              'There may be a problem with the deployment of Azure Function App, please deploy Azure Function (Run command palette "TeamsFx - Deploy Package") first before running this App';
          } else if (err.message === "Network Error") {
            funcErrorMsg =
              "Cannot call Azure Function due to network error, please check your network connection status and ";
            if (err.config.url.indexOf("localhost") >= 0) {
              funcErrorMsg +=
                'make sure to start Azure Function locally (Run "npm run start" command inside api folder from terminal) first before running this App';
            } else {
              funcErrorMsg +=
                'make sure to provision and deploy Azure Function (Run command palette "TeamsFx - Provision Resource" and "TeamsFx - Deploy Package") first before running this App';
            }
          } else {
            funcErrorMsg = err.toString();
            if (err.response?.data?.error) {
              funcErrorMsg += ": " + err.response.data.error;
            }
            alert(funcErrorMsg);
          }
        }
        return message;
    }

    clearComponentState(){
      //TODO: to add proper component clear both in UI and value
      this.setState(
        {
          address  : null,
          comment  : "",
          date     : null,
          priority : "normal"
        }
      );
    }

    render(){
        //TODO: To be added in DB as dynamic data for radio group values or create common constant files for radio group etc.
        const priorityList = [
            {
                key: '0',
                label: 'Low',
                value: 'low',
            },
            {
                key: '1',
                label: 'Normal',
                value: 'normal',
            },
            {
                key: '2',
                label: 'High',
                value: 'high',
            }
        ] 
        
        //TODO:  To use Microsoft graph API in retrieving user data of members in the same organization.
        const inputItems = [
            {
              header: 'Esmeraldo Ybanez',
              image: 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/RobertTolbert.jpg',
              content: 'Software Engineer',
            },
            {
              header: 'Ian Steven Colina',
              image: 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/WandaHoward.jpg',
              content: 'UX Designer 2',
            },
            {
              header: 'Jhon Carlo Vano',
              image: 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/TimDeboer.jpg',
              content: 'Principal Software Engineering Manager',
            },
        ]
        return (
            <div>
              {this.state.bypass === true && <div className="auth">
                <Profile userInfo={this.userInfo} />
                <h2>Welcome to ReviewIt Alpha App</h2>
                <Button primary onClick={() => this.loginBtnClick()}>Start</Button>
              </div>}
              {this.state.bypass === false && <div className="section-margin">
                  <Card aria-roledescription="draft"
                    elevated
                    inverted
                    className="customCardFluid">
                      <CardHeader>
                        <Flex gap="gap.small">
                           <Text content="Sample.docx" weight="bold" size="large"/>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <Flex gap="gap.medium">
                            <Flex.Item>
                                <Text content="To" weight="bold" size="medium" className="customCardSpace"/>
                            </Flex.Item>
                            <Flex.Item>
                               <Dropdown
                                  multiple
                                  search
                                  fluid
                                  onChange={this.handleChange}
                                  aria-required={true}
                                  items={inputItems}
                                  placeholder="Start typing a name"
                                  noResultsMessage="We couldn't find any matches."
                                  a11ySelectedItemsMessage="Press Delete or Backspace to remove"
                                  className="customCardSpace"
                                  id="emailAddress"
                                />
                            </Flex.Item>
                        </Flex>
                        <Flex gap="gap.medium" hAlign="stretch">
                            <Flex.Item>
                                <Text content="Due" weight="bold" size="medium" className="customCardSpace"/>
                            </Flex.Item>
                            <Flex.Item>
                                <Datepicker onDateChange={this.handleDateChange} value={this.state.date} id="dueDate" className="customCardSpace"/>
                            </Flex.Item>
                        </Flex>  
                        <Flex gap="gap.medium">
                            <Flex.Item>
                                <TextArea value={this.state.comment} onChange={this.handleChange} id="comment" style={{width:"100%", height:"200px", margin:"10px"}} placeholder="Write notes here..."/>
                            </Flex.Item>
                        </Flex> 
                        <Text style={{textDecoration:"underline"}} content="Importance" weight="bold" size="medium" className="customCardSpace"/>
                        <RadioGroup value={this.state.priority} onCheckedValueChange={this.handleCheckedValueChange} id="priority" items={priorityList} defaultCheckedValue="normal" className="customCardSpace"/>
                      </CardBody>
                      <CardFooter>
                          <Flex gap="gap.large" hAlign="center">
                          <Dialog
                            cancelButton="Cancel"
                            confirmButton="Confirm"
                            onConfirm={this.handleSubmit}
                            content="Are you sure you want to confirm this action?"
                            header="Action confirmation"
                            trigger={<Button secondary content="Save draft"/>}
                          />
                          <Button secondary content="Start review"/> 
                          </Flex>
                      </CardFooter>
                  </Card>
              </div>}
            </div>
        )
    }
}
