#include <bits/stdc++.h>
#define ll long long
using namespace std;
/*
    *
    * Hasan Yildirim
    *
*/
struct Variable{
	string implementation;
	string comment;
	string variable;
	int colorId;
	Variable(string temp , int id){
		variable = temp;
		comment = "";
		implementation = "";
		colorId = id;
	}
	
};
struct Constant{
	string implementation;
	string comment;
	string constant;
	int colorId;
	Constant(string temp , int id){
		constant = temp;
		comment = "";
		implementation = "";
		colorId = id;
	}
	
};
class Step{
public:
	bool subStep;
	bool counter;
	string text;
	string implementation;
	int indent;
	map<int,int> variables;
	map<int,int> constants;
	Step(){
		subStep = false;
		counter = false;
		implementation = "";
		indent = 0;
	}
	void addVariable(int start , int end , int id){
		for(int i = start ; i <= end ; i++){
			variables[i] = id;
		}
	}
	void addConstant(int start , int end , int id){
		for(int i = start ; i <= end ; i++){
			constants[i] = id;
		}
	}
	vector<int> colorCharMap(){
		vector<int> res(text.size());
		for(int i = 0 ; i < text.size() ; i++){
			if(variables[i])
				res[i] = variables[i];
			if(constants[i])
				res[i] = constants[i];
		}
		return res;
	}

};
class Model{
private:
	vector<struct Step> steps;
	vector<struct Variable> variables;
	vector<struct Constant> constants;
	int position;
	bool hideStep;
	bool hideSubStep;
	bool isWord(string str){
		int n = str.size();
		for(int i = 0 ; i < n ; i++){
			if(str[i] == ' ')
				return false;
		}
		return true;
	}
	bool sameConstant(struct Constant temp , string str){
		if(!temp.constant.compare(str))
			return true;
		return false;
	}
	bool sameVariable(struct Variable temp , string str){
		if(!temp.variable.compare(str))
			return true;
		return false;
	}
public:
	Model(){
		position = -1;
		hideStep = false;
		hideSubStep = false;
	}
	int getStepSize(){
		return steps.size();
	}
	void changePosition(int index1 , int index2){ // index1 to one before index2
		class Step temp = steps[index1];
		if(index1 == index2)
			return;
		if(index1 > index2){
			for(int i = index1 ; i > index2 ; i--){
				steps[i] = steps[i-1];
			}
			steps[index2] = temp;
		}
		else{
			for(int i = index1 ; i < index2-1 ; i++){
				steps[i] = steps[i+1];
			}
			steps[index2-1] = temp;
		}
	}
	bool addConstant(string add , int id){ // id should be start from 1 and increase for every cons and variable 
		//if add is not a word return false
		if(!isWord(add))
			return false;
		//if add is a variable or already declared constant return false
		for(int i = 0 ; i < variables.size() ; i++){
			if(sameVariable(variables[i] , add))
				return false;
		}
		for(int i = 0 ; i < constants.size() ; i++){
			if(sameConstant(constants[i] , add))
				return false;
		}
		//create and add the constant 
		struct Constant temp(add , id); 
		constants.push_back(temp);
		//change all the steps color map
		for(int i = 0 ; i < steps.size() ; i++){
			//get every word from the string

		}	
		return true;
	}
	void addVariable(string add , int id){
		struct Variable temp(add , id);
		variables.push_back(temp);
	}
	void changeStepShowing(){
		hideStep = !hideStep;
	}
	void changeSideStepShowing(){
		hideSubStep = !hideSubStep;
	}
	void createNew(){
		steps.clear();
		variables.clear();
		constants.clear();
		position = -1;
		hideStep = false;
		hideSubStep = false;
	}
	void startTrace(){
		position = 0;
		//This will need progress
	}
	void stopTrace(){
		position = -1;
	}
	void deleteStep(int index){
		steps.erase(steps.begin() + index);
	}
	
	void implementStep(int index , string implementation){
		steps[index].implementation = implementation;
	}
	void increaseIndent(int index){
		steps[index].indent += 1;
	}
	void decreaseIndent(int index){
		steps[index].indent += 1;
	}
	string createTemplate(){
		string res = "#include <bits/stdc++.h>\n#define ll long long\nusing namespace std;\n/*\n*\n* @author\n*\n*/\nint main(){\n\t";
		
		res+= "//Constants\n\t";
		for(int i = 0 ; i < constants.size() ; i++){
			res += "//";
			res += constants[i].constant;
			res += " - ";
			res += constants[i].comment;
			res += "\n\t";
			res += constants[i].implementation;
			res += "\n\t";
		}
		res+= "//Variables\n\t";
		for(int i = 0 ; i < variables.size() ; i++){
			res += "//";
			res += variables[i].variable;
			res += " - ";
			res += variables[i].comment;
			res += "\n\t";
			res += variables[i].implementation;
			res += "\n\t";
		}
		res += "//Program Code\n\t";
		for(int i = 0 ; i < steps.size() ; i++){
			if(!steps[i].subStep){
				res += "/*\n\t * ";
				for(int j = 0 ; j < steps[i].indent ; j++){
					res += "\t";
				}
				res += steps[i].text;
				res += "\n\t*/\n\t";
			}
			else{
				for(int j = 0 ; j < steps[i].indent ; j++){
					res += "\t";
				}
				res += "//";
				res += steps[i].text;
				res += "\n\t";
			}
			if(steps[i].implementation.compare("")){
				for(int j = 0 ; j < steps[i].indent ; j++){
					res += "\t";
				}
				res += steps[i].implementation;
				res += "\n\t";
			}
		}
		res += "return 0;\n}";
		return res;
	}
	void addStep(string text){
		struct Step add;
		add.text = text;
		steps.push_back(add);
	}
	void addSubStep(string text){
		struct Step add;
		add.text = text;
		add.subStep = true;
		steps.push_back(add);
	}
	void save(){
		//Save it to a txt or server, can do txt implementation easily in minutes
	}
	void load(){
		//same as save
	}
	void changePositionToLast(int index){
		this->changePosition(index , this->getStepSize());
	}

};
int main(){
	class Model deneme;
	deneme.addStep("Step 1: Read an integer from user");
	deneme.addSubStep("1.1 Read from user");
	deneme.addSubStep("1.2 Assign it to an integer called n");
	deneme.implementStep(2 , "int a;");
	deneme.increaseIndent(2);
	deneme.changePositionToLast(1);
	cout<<deneme.createTemplate()<<endl;
	
	//Exam Average Problem
	class Model test;
	test.addStep("Step 1: Ask for and get a number from exam sheets from user");
	
	test.addSubStep("1.1 Prompt user to enter number of exam sheets");
	test.increaseIndent(1);
	test.implementStep(1 , "System.out.print( \"Enter the number of exam sheets to process \");");
	
	test.addSubStep("1.2 Read number of exam sheets from keyboard");
	test.increaseIndent(2);
	test.implementStep(2 , "numberOfExamSheets = scan.nextInt();");
	
	test.addStep("Step 2: For the given number of exam sheets, read each score and use to calculate sum of scores");
	
	test.addSubStep("2.1 Initialise sum of scores so far to 0");
	test.implementStep(4 , "sumOfScoresSoFar = 0;");
	test.increaseIndent(4);
	
	test.addSubStep("2.2 for each sheet from 1 to number of exam sheets");
	test.increaseIndent(5);
	test.implementStep(5 , "for ( sheet = 1; sheet <= numberOfExamSheets; sheet = sheet + 1) {");
	
	test.addSubStep("2.2.1 prompt user for exam score");
	test.increaseIndent(6);
	test.increaseIndent(6);
	test.implementStep(6 , "System.out.print( \"Enter exam score \");");
	
	test.addSubStep("2.2.2 get the exam score for the current sheet");
	test.increaseIndent(7);
	test.increaseIndent(7);
	test.implementStep(7 , "examScore = scan.nextInt();");
	
	test.addSubStep("2.2.3 add exam score to sum of scores so far");
	test.increaseIndent(8);
	test.increaseIndent(8);
	test.implementStep(8 , "sumOfScoresSoFar = sumOfScoresSoFar + examScore; }");
	
	test.addSubStep("2.3    sum of scores is sum of scores so far");
	test.increaseIndent(9);
	test.implementStep(9, "sumOfScores = sumOfScoresSoFar;");
	
	test.addStep("3. Compute average as sum of scores divided by number of exam sheets");
	test.implementStep(10, "average = sumOfScores / numberOfExamSheets;");
	
	test.addStep("4. Report average");
	test.implementStep(11, "System.out.println( \"The average for the exam is \" + average);");
	//test.changePositionToLast(1);
	cout<<test.createTemplate()<<endl;
	
    return 0;
}
