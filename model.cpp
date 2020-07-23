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
	Variable(string param){
		variable = param;
		comment = "";
		implementation = "";
	}
};
struct Constant{
	string implementation;
	string comment;
	string constant;
	Constant(string temp){
		constant = temp;
		comment = "";
		implementation = "";
	}
};
struct Step{
	bool subStep;
	bool counter;
	string text;
	string implementation;
	int indent;
	Step(){
		subStep = false;
		counter = false;
		implementation = "";
		indent = 0;
	}
};
class Psuedo{
	vector<struct Step> steps;
	vector<struct Variable> variables;
	vector<struct Constant> constants;
	int position;
	bool hideStep;
	bool hideSubStep;
	Psuedo(){
		position = -1;
		hideStep = false;
		hideSubStep = false;
	}
	void changeStepShowing(){
		hideStep = ~hideStep;
	}
	void changeSideStepShowing(){
		hideSubStep = ~hideSubStep;
	}
	void createNew(){
		steps.clear();
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
	void addConstant(string add){
		Constant cons(add);
		constants.push_back(cons);
	}
	void increaseIndent(int index){
		steps[index].indent += 1;
	}
	void decreaseIndent(int index){
		steps[index].indent += 1;
	}
	string createTemplate(){
		string res = "#include <bits/stdc++.h>\n#define ll long long\nusing namespace std;\n/*\n*\n* Hasan Yildirim\n*\n*/\nint main(){\n\t";
		
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
		//Save it to a txt or server, can do txt easily in minutes
	}
	string load(){
		//same as save
		return "";
	}

};
int main(){

    return 0;
}