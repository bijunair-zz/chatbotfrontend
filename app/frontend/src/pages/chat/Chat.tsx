import { useRef, useState, useEffect } from "react";
import { Checkbox, ChoiceGroup, Panel, DefaultButton, TextField, SpinButton, Dropdown, IDropdownOption, IChoiceGroupOption } from "@fluentui/react";
import { SparkleFilled } from "@fluentui/react-icons";
import readNDJSONStream from "ndjson-readablestream";

import styles from "./Chat.module.css";

import {
    chatApi,
    RetrievalMode,
    ChatAppResponse,
    ChatAppResponseOrError,
    ChatAppRequest,
    ResponseMessage,
    Approaches,
    SKMode
} from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { SettingsButton } from "../../components/SettingsButton";
import { ClearChatButton } from "../../components/ClearChatButton";
import { useLogin, getToken } from "../../authConfig";
import { useMsal } from "@azure/msal-react";
import { TokenClaimsDisplay } from "../../components/TokenClaimsDisplay";
import chatLogo from "../../../public/chatLogo.png";
import Suggestion from "../../components/Suggestion/Suggestion";
import { useLocation } from "react-router-dom";

const Chat = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [approach, setApproach] = useState<Approaches>(Approaches.JAVA_OPENAI_SDK);
    const [skMode, setSKMode] = useState<SKMode>(SKMode.Chains);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [retrieveCount, setRetrieveCount] = useState<number>(3);
    const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Hybrid);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
    const [shouldStream, setShouldStream] = useState<boolean>(true);
    const [streamAvailable, setStreamAvailable] = useState<boolean>(true);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [excludeCategory, setExcludeCategory] = useState<string>("");
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(false);
    const [useOidSecurityFilter, setUseOidSecurityFilter] = useState<boolean>(false);
    const [useGroupsSecurityFilter, setUseGroupsSecurityFilter] = useState<boolean>(false);

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: string, response: ChatAppResponse][]>([]);
    const [streamedAnswers, setStreamedAnswers] = useState<[user: string, response: ChatAppResponse][]>([]);
    const [checkProductName,setCheckProductName]=useState(false);
    const location = useLocation();

    const handleAsyncRequest = async (question: string, answers: [string, ChatAppResponse][], setAnswers: Function, responseBody: ReadableStream<any>) => {
        let answer: string = "";
        let askResponse: ChatAppResponse = {} as ChatAppResponse;

        const updateState = (newContent: string) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    answer += newContent;
                    const latestResponse: ChatAppResponse = {
                        ...askResponse,
                        choices: [{ ...askResponse.choices[0], message: { content: answer, role: askResponse.choices[0].message.role } }]
                    };
                    setStreamedAnswers([...answers, [question, latestResponse]]);
                    resolve(null);
                }, 33);
            });
        };
        try {
            setIsStreaming(true);
            for await (const event of readNDJSONStream(responseBody)) {
                if (event["choices"] && event["choices"][0]["context"] && event["choices"][0]["context"]["data_points"]) {
                    event["choices"][0]["message"] = event["choices"][0]["delta"];
                    askResponse = event;
                    answer = askResponse["choices"][0]["message"]["content"];
                } else if (event["choices"] && event["choices"][0]["delta"]["content"]) {
                    setIsLoading(false);
                    await updateState(event["choices"][0]["delta"]["content"]);
                }
            }
        } finally {
            setIsStreaming(false);
        }
        const fullResponse: ChatAppResponse = {
            ...askResponse,
            choices: [{ ...askResponse.choices[0], message: { content: answer, role: askResponse.choices[0].message.role } }]
        };
        return fullResponse;
    };

    const client = useLogin ? useMsal().instance : undefined;

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        error && setError(undefined);
        setIsLoading(true);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);

        const token = client ? await getToken(client) : undefined;

        try {
            const messages: ResponseMessage[] = answers.flatMap(a => [
                { content: a[0], role: "user" },
                { content: a[1].choices[0].message.content, role: "assistant" }
            ]);

            const stream = streamAvailable && shouldStream;
            const request: ChatAppRequest = {
                messages: [...messages, { content: question, role: "user" }],
                stream: stream,
                context: {
                    overrides: {
                        prompt_template: promptTemplate.length === 0 ? undefined : promptTemplate,
                        exclude_category: excludeCategory.length === 0 ? undefined : excludeCategory,
                        top: retrieveCount,
                        retrieval_mode: retrievalMode,
                        semantic_ranker: useSemanticRanker,
                        semantic_captions: useSemanticCaptions,
                        suggest_followup_questions: useSuggestFollowupQuestions,
                        use_oid_security_filter: useOidSecurityFilter,
                        use_groups_security_filter: useGroupsSecurityFilter,
                        semantic_kernel_mode: skMode
                    }
                },
                approach: approach,
                // ChatAppProtocol: Client must pass on any session state received from the server
                session_state: answers.length ? answers[answers.length - 1][1].choices[0].session_state : null
            };

            const response = await chatApi(request, token?.accessToken);
            if (!response.body) {
                throw Error("No response body");
            }
            if (stream) {
                const parsedResponse: ChatAppResponse = await handleAsyncRequest(question, answers, setAnswers, response.body);
                setAnswers([...answers, [question, parsedResponse]]);
            } else {
                const parsedResponse: ChatAppResponseOrError = await response.json();
                if (response.status > 299 || !response.ok) {
                    throw Error(parsedResponse.error || "Unknown error");
                }
                setAnswers([...answers, [question, parsedResponse as ChatAppResponse]]);
            }
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setAnswers([]);
        setStreamedAnswers([]);
        setIsLoading(false);
        setIsStreaming(false);
    };

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading]);
    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "auto" }), [streamedAnswers]);

    const onPromptTemplateChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplate(newValue || "");
    };

    const onRetrieveCountChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setRetrieveCount(parseInt(newValue || "3"));
    };

    const onRetrievalModeChange = (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption<RetrievalMode> | undefined, index?: number | undefined) => {
        setRetrievalMode(option?.data || RetrievalMode.Hybrid);
    };

    const onSKModeChange = (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption<SKMode> | undefined, index?: number | undefined) => {
        setSKMode(option?.data || SKMode.Chains);
    };

    const onApproachChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
        const newApproach = (option?.key as Approaches);
        setApproach(newApproach || Approaches.JAVA_OPENAI_SDK);
        setStreamAvailable(newApproach === Approaches.JAVA_OPENAI_SDK);
    };

    const onUseSemanticRankerChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticRanker(!!checked);
    };

    const onUseSemanticCaptionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticCaptions(!!checked);
    };

    const onShouldStreamChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setShouldStream(!!checked);
    };

    const onExcludeCategoryChanged = (_ev?: React.FormEvent, newValue?: string) => {
        setExcludeCategory(newValue || "");
    };

    const onUseSuggestFollowupQuestionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSuggestFollowupQuestions(!!checked);
    };

    const onUseOidSecurityFilterChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseOidSecurityFilter(!!checked);
    };

    const onUseGroupsSecurityFilterChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseGroupsSecurityFilter(!!checked);
    };

    const onExampleClicked = (example: string) => {
        makeApiRequest(example);
    };

    const onShowCitation = (citation: string, index: number) => {
        if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveCitation(citation);
            setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
        }

        setSelectedAnswer(index);
    };

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };

    const approaches: IChoiceGroupOption[] = [
        {
            key: Approaches.JAVA_OPENAI_SDK,
            text: "Java Azure Open AI SDK"
        },
        {
            key: Approaches.JAVA_SEMANTIC_KERNEL,
            text: "Java Semantic Kernel - Memory"
        },
        {
            key: Approaches.JAVA_SEMANTIC_KERNEL_PLANNER,
            text: "Java Semantic Kernel - Orchestration"
        }
    ];

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const delay = 500; // Set the delay time in milliseconds (5 seconds in this example)

    useEffect(() => {
        if (!isChatOpen) {
            let timer: any;

            const handleEvent = () => {
                // Event occurred, so clear the timer
                clearTimeout(timer);
            };

            const startTimer = () => {
                timer = setInterval(() => {
                    // Timer elapsed, update the state
                    setIsChatOpen(!isChatOpen);
                }, delay);
            };

            // Attach your event listeners
            // For example, assuming you're waiting for click, keydown, and mousemove events
            document.addEventListener("click", handleEvent);
            document.addEventListener("keydown", handleEvent);
            document.addEventListener("mousemove", handleEvent);

            // Start the timer on mount
            startTimer();
        }
        // return () => {
        //     // Cleanup: Remove the event listeners and clear the timer on component unmount
        //     document.removeEventListener("click", handleEvent);
        //     document.removeEventListener("keydown", handleEvent);
        //     document.removeEventListener("mousemove", handleEvent);
        //     clearTimeout(timer);
        // };
    }, [isChatOpen]); // Empty dependency array means this effect runs once on mount

    useEffect(()=>{
       setCheckProductName(location.pathname.includes("product") )
        
    },[])
    return (
        <div className={styles.container}>
            {/* <div className={styles.commandsContainer}>
                <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
            </div> */}
            {isChatOpen && (
                <div className={styles.chatSection}>
                    <div className={styles.chatHeaderSection}>
                        <div className={styles.chatHeaderLogoSection}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="54" viewBox="0 0 50 54" fill="none">
                                <rect width="50" height="50" rx="8" fill="#010403" />
                                <circle cx="39.5" cy="47.5" r="5.75" fill="#2DDF2A" stroke="#EEEEEB" stroke-width="1.5" />
                                <rect
                                    x="33.6954"
                                    y="32.4028"
                                    width="2.48673"
                                    height="18.9604"
                                    rx="1.24336"
                                    transform="rotate(45 33.6954 32.4028)"
                                    fill="#B18E6F"
                                />
                                <rect
                                    x="28.7569"
                                    y="3.43188"
                                    width="2.49844"
                                    height="18.9604"
                                    rx="1.24922"
                                    transform="rotate(45 28.7569 3.43188)"
                                    fill="#B18E6F"
                                />
                                <circle cx="24.7277" cy="26.1844" r="11.7723" stroke="#B18E6F" stroke-width="3" />
                                <path
                                    d="M27 26.5C27 28.1656 26.1956 29.6199 25 30.398C24.4117 30.7809 23.7286 31 23 31C20.7909 31 19 28.9853 19 26.5C19 24.0147 20.7909 22 23 22C23.7286 22 24.4117 22.2191 25 22.602C26.1956 23.3801 27 24.8344 27 26.5Z"
                                    fill="#B18E6F"
                                    stroke="#B18E6F"
                                />
                                <ellipse cx="26.5" cy="26.5" rx="3.5" ry="4.5" stroke="#B18E6F" />
                                <mask id="mask0_1_118" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="18" y="21" width="10" height="11">
                                    <path
                                        d="M27 26.5C27 28.1656 26.1956 29.6199 25 30.398C24.4117 30.7809 23.7286 31 23 31C20.7909 31 19 28.9853 19 26.5C19 24.0147 20.7909 22 23 22C23.7286 22 24.4117 22.2191 25 22.602C26.1956 23.3801 27 24.8344 27 26.5Z"
                                        fill="#B18E6F"
                                        stroke="#B18E6F"
                                    />
                                </mask>
                                <g mask="url(#mask0_1_118)">
                                    <ellipse cx="26.5" cy="26.5" rx="3.5" ry="4.5" stroke="#010403" />
                                </g>
                            </svg>
                        </div>
                        <div className="popupClose" onClick={toggleChat}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <mask id="mask0_1_131" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40">
                                    <rect width="40" height="40" fill="#D9D9D9" />
                                </mask>
                                <g mask="url(#mask0_1_131)">
                                    <path
                                        d="M10.579 30.4251L9.57479 29.4209L18.9957 19.9999L9.57479 10.579L10.579 9.57471L20 18.9956L29.421 9.57471L30.4252 10.579L21.0043 19.9999L30.4252 29.4209L29.421 30.4251L20 21.0042L10.579 30.4251Z"
                                        fill="#343434"
                                    />
                                </g>
                            </svg>
                        </div>
                    </div>
                    <div className={styles.chatRoot}>
                        <div className={styles.chatContainer}>
                            {!lastQuestionRef.current ? (
                                <div className={styles.chatEmptyState}>
                                     {/* <SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" /> */}
                                    {/* <h1 className={styles.chatEmptyStateTitle}>Chat with your data</h1> */}
                                    <h2 className={styles.chatEmptyStateSubtitle}>Chat with your data</h2>
                                    {!checkProductName ? 
                                    <div className={styles.greatingMessage}>We are here to assist you with your return process.</div>
                                    : 
                                    <div className={styles.greatingMessage}>We are here to assist you for your product. </div>
                                    }
                                    <ExampleList onExampleClicked={onExampleClicked} />
                                    {/* <Suggestion /> */}
                                </div>
                            ) : (
                                <div className={styles.chatMessageStream}>
                                    {isStreaming &&
                                        streamedAnswers.map((streamedAnswer, index) => (
                                            <div key={index}>
                                                <UserChatMessage message={streamedAnswer[0]} />
                                                <div className={styles.chatMessageGpt}>
                                                    <Answer
                                                        isStreaming={true}
                                                        key={index}
                                                        answer={streamedAnswer[1]}
                                                        isSelected={false}
                                                        onCitationClicked={c => onShowCitation(c, index)}
                                                        onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                                        onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                                        onFollowupQuestionClicked={q => makeApiRequest(q)}
                                                        showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    {!isStreaming &&
                                        answers.map((answer, index) => (
                                            <div key={index}>
                                                <UserChatMessage message={answer[0]} />
                                                <div className={styles.chatMessageGpt}>
                                                    <Answer
                                                        isStreaming={false}
                                                        key={index}
                                                        answer={answer[1]}
                                                        isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                                        onCitationClicked={c => onShowCitation(c, index)}
                                                        onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                                        onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                                        onFollowupQuestionClicked={q => makeApiRequest(q)}
                                                        showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    {isLoading && (
                                        <>
                                            <UserChatMessage message={lastQuestionRef.current} />
                                            <div className={styles.chatMessageGptMinWidth}>
                                                <AnswerLoading />
                                            </div>
                                        </>
                                    )}
                                    {error ? (
                                        <>
                                            <UserChatMessage message={lastQuestionRef.current} />
                                            <div className={styles.chatMessageGptMinWidth}>
                                                <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current)} />
                                            </div>
                                        </>
                                    ) : null}
                                    <div ref={chatMessageStreamEnd} />
                                </div>
                            )}

                            <div className={styles.chatInput}>
                                <QuestionInput
                                    clearOnSend
                                    placeholder="Type a new question (e.g. How long it takes to return?)"
                                    disabled={isLoading}
                                    onSend={question => makeApiRequest(question)}
                                />
                            </div>
                        </div>

                        {answers.length > 0 && activeAnalysisPanelTab && (
                            <AnalysisPanel
                                className={styles.chatAnalysisPanel}
                                activeCitation={activeCitation}
                                onActiveTabChanged={x => onToggleTab(x, selectedAnswer)}
                                citationHeight="810px"
                                answer={answers[selectedAnswer][1]}
                                activeTab={activeAnalysisPanelTab}
                            />
                        )}

                        <Panel
                            headerText="Configure answer generation"
                            isOpen={isConfigPanelOpen}
                            isBlocking={false}
                            onDismiss={() => setIsConfigPanelOpen(false)}
                            closeButtonAriaLabel="Close"
                            onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                            isFooterAtBottom={true}
                        >
                            <ChoiceGroup
                                className={styles.chatSettingsSeparator}
                                label="Approach"
                                options={approaches}
                                defaultSelectedKey={approach}
                                onChange={onApproachChange}
                            />

                            {(approach === Approaches.JAVA_OPENAI_SDK || approach === Approaches.JAVA_SEMANTIC_KERNEL) && (
                                <TextField
                                    className={styles.chatSettingsSeparator}
                                    defaultValue={promptTemplate}
                                    label="Override prompt template"
                                    multiline
                                    autoAdjustHeight
                                    onChange={onPromptTemplateChange}
                                />
                            )}
                            {(approach === Approaches.JAVA_SEMANTIC_KERNEL_PLANNER) && (
                                <Dropdown
                                    className={styles.oneshotSettingsSeparator}
                                    label="Semantic Kernel mode"
                                    options={[
                                        { key: "chains", text: "Function Chaining", selected: skMode == SKMode.Chains, data: SKMode.Chains },
                                        { key: "planner", text: "Planner", selected: skMode == SKMode.Planner, data: SKMode.Planner, disabled: true }
                                    ]}
                                    required
                                    onChange={onSKModeChange}
                                />
                            )}

                            <SpinButton
                                className={styles.chatSettingsSeparator}
                                label="Retrieve this many search results:"
                                min={1}
                                max={50}
                                defaultValue={retrieveCount.toString()}
                                onChange={onRetrieveCountChange}
                            />
                            <TextField className={styles.chatSettingsSeparator} label="Exclude category" onChange={onExcludeCategoryChanged} />
                            <Checkbox
                                className={styles.chatSettingsSeparator}
                                checked={useSemanticRanker}
                                label="Use semantic ranker for retrieval"
                                onChange={onUseSemanticRankerChange}
                            />
                            <Checkbox
                                className={styles.chatSettingsSeparator}
                                checked={useSemanticCaptions}
                                label="Use query-contextual summaries instead of whole documents"
                                onChange={onUseSemanticCaptionsChange}
                                disabled={!useSemanticRanker}
                            />
                            <Checkbox
                                className={styles.chatSettingsSeparator}
                                checked={useSuggestFollowupQuestions}
                                label="Suggest follow-up questions"
                                onChange={onUseSuggestFollowupQuestionsChange}
                            />
                            {useLogin && (
                                <Checkbox
                                    className={styles.chatSettingsSeparator}
                                    checked={useOidSecurityFilter}
                                    label="Use oid security filter"
                                    disabled={!client?.getActiveAccount()}
                                    onChange={onUseOidSecurityFilterChange}
                                />
                            )}
                            {useLogin && (
                                <Checkbox
                                    className={styles.chatSettingsSeparator}
                                    checked={useGroupsSecurityFilter}
                                    label="Use groups security filter"
                                    disabled={!client?.getActiveAccount()}
                                    onChange={onUseGroupsSecurityFilterChange}
                                />
                            )}
                            <Dropdown
                                className={styles.chatSettingsSeparator}
                                label="Retrieval mode"
                                options={[
                                    { key: "hybrid", text: "Vectors + Text (Hybrid)", selected: retrievalMode == RetrievalMode.Hybrid, data: RetrievalMode.Hybrid },
                                    { key: "vectors", text: "Vectors", selected: retrievalMode == RetrievalMode.Vectors, data: RetrievalMode.Vectors },
                                    { key: "text", text: "Text", selected: retrievalMode == RetrievalMode.Text, data: RetrievalMode.Text }
                                ]}
                                required
                                onChange={onRetrievalModeChange}
                            />
                            {streamAvailable &&
                                <Checkbox
                                    className={styles.chatSettingsSeparator}
                                    checked={shouldStream}
                                    label="Stream chat completion responses"
                                    onChange={onShouldStreamChange}
                                />
                            }

                            {useLogin && <TokenClaimsDisplay />}
                        </Panel>
                    </div>
            </div>
            )}
            {!isChatOpen && (
                <div className={styles.chatCloseSection} onClick={toggleChat}>
                    <img src={chatLogo} alt="logo" />
                    <p>Need Help?</p>
                </div>
            )}
        </div>
    );
};

export default Chat;
