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
struct Step{
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
class Psuedo{
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
	Psuedo(){
		position = -1;
		hideStep = false;
		hideSubStep = false;
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
				res += steps[i].text;
				res += "\n\t*/\n\t";
			}
			else{
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

};
int main(){
	struct Variable temp("deneme" , 1);
	cout<<temp.variable<<endl;
	cout<<temp.comment<<endl;
    return 0;
}