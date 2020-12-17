from os import system
import requests
import subprocess
import sys
from time import sleep
import json
from tqdm import tqdm
import os
def getList():
    res=requests.post("http://127.0.0.1:3000/list")
    if res.status_code=='404':
        print("请稍后尝试")
        exit()
    else:
        ##print(json.loads(res.text))
        with open("list.txt",'w+') as f:
            text=""
            for items in json.loads(res.text):
                text+=items['question_name']+'\n'
            f.write(text)
def judge(dir,identity,password,network):
    cmd="python3 -u {}/question.py".format(dir)
    p = subprocess.Popen(cmd.split(), shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    p.wait(6)
    stringres=bytes.decode(p.stdout.read().strip())
    print('\n---------------------------------运行结果--------------------------------')
    print(stringres)
    print('-------------------------------------------------------------------------\n')
    if network:
        data={"user":identity,"password":password,"question":dir[10:],"anwser":stringres};
        res=requests.post("http://127.0.0.1:3000/update",data=data)
        if res.status_code=='404':
            print("请稍后尝试 ")
            return False;
        else:
            if res.text=="correct!":
                return True;
            elif res.text=="None":
                print("发生了肾么？题库里没这题啊")
                return False;
    else:
        with open(dir+"/anwser.txt",'r') as f:
            text=f.read().strip()
        if(stringres==text):
            return True
        else:
            return False


def watching (questions,user,password):
    for question in questions:
        print("正在检查{}....".format(question))
        dir="questions/{}".format(question)
        anwser=''
        while(True):
            try:
                with open(dir+"/question.py",'r')as f:
                    anwser=text=f.read()
                if "## I HAVE DONE" not in text:
                    if judge(dir,user,password,1):
                        print("回答正确!\n-------------------------------------------------------------------------\n")
                        break
                    else:
                        print("回答错误")
                        while(True):
                            with open(dir+"/question.py",'r')as f:
                                text=f.read()
                            if anwser!=text:
                                anwser=text
                                sleep(2)
                                break
                else:
                    while(True):
                        with open(dir+"/question.py",'r')as f:
                                text=f.read()
                        if anwser!=text:
                            anwser=text
                            sleep(2)
                            break
            except IOError:
                print("Error: 没有找到题目或读取题目失败")
                print("建议重新下载啊客户端")
                exit(0)
                
    print("恭喜！您已完成所有习题！")
    input("任意键继续： ")



        
        


def veritify(questions,user,password):
    for question in questions:
        print("正在检查{}....".format(question))
        dir="questions/{}".format(question)
        with open(dir+'/question.py','r') as f:
            if "## I HAVE DONE" in f.read():
                if judge(dir,user,password,0) :
                    print("回答正确!\n")
                else:
                    print("回答错误!\n")
                break
            else:
                continue

def getques(questions):
    for question in tqdm(questions):
        if os.path.exists(os.getcwd()+"/questions/{}".format(question)):
            continue
        else:
            res=requests.post("http://127.0.0.1:3000/fenfa",data={"name":question})
            if res.status_code==404:
                print("网络连接异常")
                exit()
            if res.text=="no":
                print("服务器错误")
                exit()
            elif len(res.text)>0:
                path='questions/{}'.format(question)
                try:
                    os.makedirs(path)
                except:
                    pass
                with open('questions/{}/question.py'.format(question),"w+") as f:
                    f.write(res.text)


            
if __name__ == "__main__":
    with open("config.txt",'r+') as f:
        text=f.read()
        if text=="":
            identity=input("请输入你的学号：")
            password=input("请输入你的密码：")
            f.write(identity+'\n'+password)
        else :
            identity,password = text.split()
            print("确认你的学号是：{}".format(identity))
            print("确认你的密码是：{}".format(password))
            input("任意键继续： ")
    print("正在加载题目列表请稍等\n")
    getList()
    with open("list.txt",'r') as f:
        questions=f.read().split('\n')
    questions =[i for i in questions if len(i)>0]
    # print(questions)
    getques(questions)
    print("加载成功\n")
    print("tips: 每完成一题，请把代码中的 ## I HAVE DONE 删除")
    print("tips: 在闯关模式下，系统将监控当前题目文件的变化，自动进行判定，不用每次都重启\n")
    while(True):
        mod=input("请选择模式：1.闯关 2.退出 请输入序号：")
        if mod=="1" :
            watching(questions,identity,password)
        else:
            exit()
    
