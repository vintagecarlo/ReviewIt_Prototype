import React from "react";
import "../css/Draft.css";
import Profile from "./Profile";
import defaultPhoto from '../../images/default-photo.png'
import { createMicrosoftGraphClient, BearerTokenAuthProvider, createApiClient, TeamsFx} from "@microsoft/teamsfx";
import {dateFormatter, callFunctionWithErrorHandling, isValidData} from "../../../utils/Utils.jsx";
import {addressListStub, priorityList,permissionScope} from "../../../utils/Constants.jsx";
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
            bypass : undefined,
            addressList : []
        }
        
        this.handleChange =  this.handleChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleCheckedValueChange = this.handleCheckedValueChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        await this.initTeamsFx();
        await this.initGraphApi();
    }

    async initTeamsFx() {
        const teamsfx = new TeamsFx();
        // Get the user info from access token
        const userInfo = await teamsfx.getUserInfo();
        this.userInfo = userInfo   

        this.teamsfx = teamsfx;
        this.scope = permissionScope();

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
        try{
          const context = await app.getContext();
          const graphClient = await createMicrosoftGraphClient(this.teamsfx, this.scope);

          if(context.team && context.channel) {
            var channelMembers = await graphClient
            .api("/teams/"+context.team.groupId+"/channels/"+context.channel.id+"/members")
            .get();
            this.setState({addressList : this.transformGraphData(channelMembers)})
          }      
          else this.setState({addressList : addressListStub()});

        }catch(err){
          alert(err)
        }
      }
    }

    async checkIsConsentNeeded() {
      try {
        await this.teamsfx.getCredential().getToken(this.scope);
      } catch (error) {
        this.setState({bypass: true});
        return true;
      }
      this.setState({bypass: false});
      return false;
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
            dateFormatter(option.value) : 
            dateFormatter(new Date())
        })
        event.preventDefault();
    }

    //for Radiogroup
    handleCheckedValueChange(event, option){
        this.setState({priority : option.value});
        event.preventDefault();
    }

    async handleSubmit(event) {
      var addresslst = JSON.parse((JSON.stringify(this.state.address)));
      let concatAddress = ""

      if(addresslst){
        let tempLstAddress = []
        addresslst.forEach(address => {
          tempLstAddress.push(address.content)
        });
        
        concatAddress = tempLstAddress.toString()
      }

      var data = {
         address : concatAddress,
         duedate : this.state.date,
         comment : this.state.comment,
         prio    : this.state.priority
      };

      var apiCall = null;

      if(isValidData(data)){
         apiCall = await callFunctionWithErrorHandling("draftApi", "post", data, this.apiClient);
         if(apiCall) this.clearComponentState();
      } else {
            //TODO: to add proper error handling and UI display
            alert('All fields are required!\naddresses: ' + ((!this.state.address) ? "?" : this.state.address ) 
            + '\ncomment: ' + ((!this.state.comment) ? "?" : this.state.comment)
            + '\ndate: ' + ((!this.state.date) ? "?" : this.state.date)
            + '\nimportance: ' + this.state.priority);
      }
      event.preventDefault();
    }
     
    transformGraphData(data){
      if(!data) return []
      var list = data.value
      var memberList = []

      list.forEach(target => {
        let image = defaultPhoto
        let member = {
          header : target.displayName,
          image : image,
          content : target.email
        }
        memberList.push(member)
      });

      return memberList
    }

    clearComponentState(){
      //TODO: to add proper component clear both in UI and value
      //Verryyy disappointing cheap tactic because fluent ui components are so difficult to clear
      window.location.reload(false)
    }

    render(){
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
                                  items={this.state.addressList}
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
                        <RadioGroup value={this.state.priority} onCheckedValueChange={this.handleCheckedValueChange} id="priority" items={priorityList()} defaultCheckedValue="normal" className="customCardSpace"/>
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
