const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");

const createProblem = async (req,res)=>{
   
  // API request to authenticate user:
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution, problemCreator
    } = req.body;


    try{
       
      for(const {language,completeCode} of referenceSolution){
         

        // source_code:
        // language_id:
        // stdin: 
        // expectedOutput:

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));


        const submitResult = await submitBatch(submissions);
        // console.log(submitResult);

        const resultToken = submitResult.map((value)=> value.token);

        // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
        
       const testResult = await submitToken(resultToken);


       console.log(testResult);

       for(const test of testResult){
        if(test.status_id!=3){
         return res.status(400).send("Error Occured");
        }
       }

      }


      // We can store it in our DB

    const userProblem =  await Problem.create({
        ...req.body,
        problemCreator: req.result._id
      });

      res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}


const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if request body exists
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                error: "Request body is missing or empty" 
            });
        }

        // Destructure with default values to prevent undefined errors
        const {
            title = '',
            description = '',
            difficulty = '',
            tags = [],
            visibleTestCases = [],
            hiddenTestCases = [],
            startCode = [],
            referenceSolution = [],
            problemCreator
        } = req.body;

        // Validate required fields
        if (!title || !description || !difficulty) {
            return res.status(400).json({ 
                error: "Missing required fields: title, description, or difficulty" 
            });
        }

        if (!id) {
            return res.status(400).json({ 
                error: "Missing ID parameter" 
            });
        }

        // Check if problem exists
        const dsaProblem = await Problem.findById(id);
        if (!dsaProblem) {
            return res.status(404).json({ 
                error: "Problem not found" 
            });
        }

        // Validate referenceSolution array
        if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) {
            return res.status(400).json({ 
                error: "Reference solution is required and must be an array" 
            });
        }

        // Validate visibleTestCases array
        if (!Array.isArray(visibleTestCases) || visibleTestCases.length === 0) {
            return res.status(400).json({ 
                error: "Visible test cases are required and must be an array" 
            });
        }

        // Test reference solutions against visible test cases
        for (const solution of referenceSolution) {
            // Validate solution structure
            if (!solution.language || !solution.completeCode) {
                return res.status(400).json({ 
                    error: "Each reference solution must have 'language' and 'completeCode' properties" 
                });
            }

            const { language, completeCode } = solution;
            const languageId = getLanguageById(language);
            
            if (!languageId) {
                return res.status(400).json({ 
                    error: `Unsupported language: ${language}` 
                });
            }

            // Create batch submission for testing
            const submissions = visibleTestCases.map((testcase) => {
                // Validate test case structure
                if (!testcase.input !== undefined && !testcase.output) {
                    throw new Error("Each test case must have 'input' and 'output' properties");
                }
                
                return {
                    source_code: completeCode,
                    language_id: languageId,
                    stdin: testcase.input,
                    expected_output: testcase.output
                };
            });

            const submitResult = await submitBatch(submissions);
            const resultTokens = submitResult.map((value) => value.token);
            const testResults = await submitToken(resultTokens);

            // Check if all tests passed
            for (const test of testResults) {
                if (test.status_id !== 3) {
                    return res.status(400).json({ 
                        error: `Reference solution failed for language ${language}`,
                        details: test
                    });
                }
            }
        }

        // Update the problem
        const updatedProblem = await Problem.findByIdAndUpdate(
            id, 
            { ...req.body }, 
            { runValidators: true, new: true }
        );

        res.status(200).json({
            message: "Problem updated successfully",
            problem: updatedProblem
        });

    } catch (err) {
        console.error('Update problem error:', err);
        res.status(500).json({ 
            error: "Internal server error",
            details: err.message 
        });
    }
};

const deleteProblem = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

   const deletedProblem = await Problem.findByIdAndDelete(id);

   if(!deletedProblem)
    return res.status(404).send("Problem is Missing");


   res.status(200).send("Successfully Deleted");
  }
  catch(err){
     
    res.status(500).send("Error: "+err);
  }
}


const getProblemById = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution studyMaterial');
   
   if(!getProblem)
    return res.status(404).send("Problem is Missing");


   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

// Controller function for getting problems with pagination
const getAllProblem = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalProblems = await Problem.countDocuments();
    
    // Get paginated problems
    const getProblem = await Problem.find({})
      .select('_id title difficulty tags')
      .skip(skip)
      .limit(limit);

    if (getProblem.length === 0) {
      return res.status(404).send("Problems not found for this page");
    }

    res.status(200).json({
      problems: getProblem,
      currentPage: page,
      totalPages: Math.ceil(totalProblems / limit),
      totalProblems
    });
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
}


const solvedAllProblembyUser =  async(req,res)=>{
   
    try{
       
      const userId = req.result._id;

      const user =  await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
      });
      
      res.status(200).send(user.problemSolved);

    }
    catch(err){
      res.status(500).send("Server Error");
    }
}

const submittedProblem = async(req,res)=>{

  try{
     
    const userId = req.result._id;
    const problemId = req.params.pid;

   const ans = await Submission.find({userId,problemId});
  
  if(ans.length==0)
    res.status(200).send("No Submission is persent");

  res.status(200).send(ans);

  }
  catch(err){
     res.status(500).send("Internal Server Error");
  }
}



module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};


